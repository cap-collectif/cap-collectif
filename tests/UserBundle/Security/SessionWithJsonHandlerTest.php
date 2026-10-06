<?php

namespace Capco\Tests\UserBundle\Security;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\SessionWithJsonHandler;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Security;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Tests the public session serialization format without asserting Redis locking calls.
 */
class SessionWithJsonHandlerTest extends TestCase
{
    public function testDecodedSessionMatchesSymfonySessionPayload(): void
    {
        $handler = $this->createHandler();
        $session = '_sf2_attributes|serialized-session';
        $viewer = new User();
        $viewer->setId('user-id');
        $viewer->setUsername('user');
        $viewer->setEmail('user@example.com');

        self::assertSame($session, $handler->decode($handler->encode($session, $viewer)));
    }

    /**
     * @dataProvider viewerRoles
     *
     * @param list<string>         $roles
     * @param array<string, mixed> $expected
     */
    public function testEncodedSessionContainsSeparatorAndViewerData(array $roles, ?string $organizationRole, array $expected): void
    {
        $viewer = new User();
        $viewer->setId('user-id');
        $viewer->setUsername('user');
        $viewer->setEmail('user@example.com');
        $viewer->setRoles($roles);
        if (null !== $organizationRole) {
            $organization = (new \Capco\AppBundle\Entity\Organization\Organization())->setId('organization-id');
            $membership = (new \Capco\AppBundle\Entity\Organization\OrganizationMember())->setUser($viewer)->setOrganization($organization)->setRole($organizationRole);
            $viewer->addMemberOfOrganization($membership);
            $organization->addMember($membership);
        }
        $before = time();
        $encoded = $this->createHandler()->encode('serialized-session', $viewer);
        [$rawSession, $json] = explode(SessionWithJsonHandler::SEPARATOR, $encoded, 2);
        $data = json_decode($json, true, 512, \JSON_THROW_ON_ERROR);

        self::assertSame('serialized-session', $rawSession);
        self::assertSame('user@example.com', $data['viewer']['email']);
        self::assertSame('user', $data['viewer']['username']);
        self::assertSame('VXNlcjp1c2VyLWlk', $data['viewer']['id']);
        foreach ($expected as $field => $value) {
            self::assertArrayHasKey($field, $data['viewer']);
            self::assertSame($value, $data['viewer'][$field], $field);
        }
        self::assertIsInt($data['last_user_activity']);
        self::assertGreaterThanOrEqual($before, $data['last_user_activity']);
        self::assertLessThanOrEqual(time(), $data['last_user_activity']);
    }

    /** @return iterable<string, array{list<string>, ?string, array<string, mixed>}> */
    public static function viewerRoles(): iterable
    {
        yield 'ordinary account' => [['ROLE_USER'], null, [
            'isAdmin' => false, 'isSuperAdmin' => false, 'isProjectAdmin' => false,
            'isAdminOrganization' => false, 'isOrganizationMember' => false,
            'isMediator' => false, 'organization' => null,
        ]];
        yield 'project administrator' => [['ROLE_PROJECT_ADMIN'], null, [
            'isAdmin' => false, 'isSuperAdmin' => false, 'isProjectAdmin' => true,
            'isAdminOrganization' => false, 'isOrganizationMember' => false,
            'isMediator' => false, 'organization' => null,
        ]];
        yield 'global administrator' => [['ROLE_ADMIN'], null, [
            'isAdmin' => true, 'isSuperAdmin' => false, 'isProjectAdmin' => true,
            'isAdminOrganization' => false, 'isOrganizationMember' => false,
            'isMediator' => false, 'organization' => null,
        ]];
        yield 'organization member' => [['ROLE_USER'], 'user', [
            'isAdmin' => false, 'isSuperAdmin' => false, 'isProjectAdmin' => false,
            'isAdminOrganization' => false, 'isOrganizationMember' => true,
            'isMediator' => false, 'organization' => 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbi1pZA==',
        ]];
        yield 'organization administrator' => [['ROLE_USER'], 'admin', [
            'isAdmin' => false, 'isSuperAdmin' => false, 'isProjectAdmin' => false,
            'isAdminOrganization' => true, 'isOrganizationMember' => true,
            'isMediator' => false, 'organization' => 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbi1pZA==',
        ]];
        yield 'super administrator and mediator in an organization' => [['ROLE_SUPER_ADMIN', 'ROLE_MEDIATOR'], 'admin', [
            'isAdmin' => true, 'isSuperAdmin' => true, 'isProjectAdmin' => true,
            'isAdminOrganization' => true, 'isOrganizationMember' => true,
            'isMediator' => true, 'organization' => 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbi1pZA==',
        ]];
    }

    public function testCanDecodeLegacySessionWithoutJsonSeparator(): void
    {
        $session = '_sf2_attributes|legacy-session';

        self::assertSame($session, $this->createHandler()->decode($session));
    }

    /** @dataProvider storedSessions */
    public function testSessionReadsRejectInactiveViewers(string $stored, string $expected): void
    {
        $redis = $this->createStub(\Redis::class);
        $redis->method('set')->willReturn(true);
        $redis->method('get')->willReturn($stored);
        $handler = $this->createHandler($redis);

        self::assertSame($expected, $handler->read('session-id'));
    }

    /** @return iterable<string, array{string, string}> */
    public static function storedSessions(): iterable
    {
        yield 'inactive viewer' => ['serialized-session' . SessionWithJsonHandler::SEPARATOR . '{"last_user_activity":0}', ''];
        yield 'legacy session' => ['legacy-session', 'legacy-session'];
        yield 'empty session' => ['', ''];
    }

    public function testSessionReadsPreserveARecentlyActiveViewersSession(): void
    {
        $redis = $this->createStub(\Redis::class);
        $redis->method('set')->willReturn(true);
        $redis->method('get')->willReturn('serialized-session' . SessionWithJsonHandler::SEPARATOR . json_encode(['last_user_activity' => time()], \JSON_THROW_ON_ERROR));

        self::assertSame('serialized-session', $this->createHandler($redis)->read('session-id'));
    }

    private function createHandler(?\Redis $redis = null): SessionWithJsonHandler
    {
        return new SessionWithJsonHandler(
            $redis ?? $this->createStub(\Redis::class),
            $this->createStub(Security::class),
            new RequestStack(),
            '',
            $this->createStub(LoggerInterface::class),
            7200,
            7200
        );
    }
}
