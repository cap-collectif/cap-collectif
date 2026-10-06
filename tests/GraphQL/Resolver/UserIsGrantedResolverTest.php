<?php

namespace Capco\Tests\GraphQL\Resolver;

use Capco\AppBundle\GraphQL\Resolver\UserIsGrantedResolver;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class UserIsGrantedResolverTest extends TestCase
{
    public function testAclCanBeDisabledByContext(): void
    {
        self::assertTrue($this->resolver(null)->isGranted(null, null, new \ArrayObject(['disable_acl' => true])));
    }

    public function testNonUserCannotBeGrantedAccess(): void
    {
        self::assertFalse($this->resolver(null)->isGranted('anon.'));
    }

    public function testViewerCanAccessTheirOwnProfile(): void
    {
        $viewer = $this->user('1', ['ROLE_USER']);
        self::assertTrue($this->resolver($this->tokenFor($viewer))->isGranted($viewer, $viewer));
    }

    public function testAdministratorCanAccessOtherProfile(): void
    {
        $admin = $this->user('1', ['ROLE_ADMIN']);
        self::assertTrue($this->resolver($this->tokenFor($admin))->isGranted($admin));
    }

    public function testViewerCannotAccessAnotherUserProfile(): void
    {
        $viewer = $this->user('1', ['ROLE_USER']);
        $subject = $this->user('3', ['ROLE_USER']);
        self::assertFalse($this->resolver($this->tokenFor($viewer))->isGranted($subject, $viewer));
    }

    public function testConnectedUserCannotAccessUnrelatedProfile(): void
    {
        $connected = $this->user('2', ['ROLE_USER']);
        $subject = $this->user('3', ['ROLE_USER']);
        self::assertFalse($this->resolver($this->tokenFor($connected))->isGranted($subject));
    }

    public function testMembersOfSameOrganizationCanAccessEachOther(): void
    {
        $viewer = $this->user('1', ['ROLE_USER'], 'org-1');
        $subject = $this->user('3', ['ROLE_USER'], 'org-1');
        self::assertTrue($this->resolver($this->tokenFor($viewer))->isGranted($subject, $viewer));
    }

    public function testMembersOfDifferentOrganizationsCannotAccessEachOther(): void
    {
        $viewer = $this->user('1', ['ROLE_USER'], 'org-1');
        $subject = $this->user('3', ['ROLE_USER'], 'org-2');
        self::assertFalse($this->resolver($this->tokenFor($viewer))->isGranted($subject, $viewer));
    }

    public function testIsViewerMatchesTheRequestedUser(): void
    {
        $viewer = $this->user('1', ['ROLE_USER']);
        $subject = $this->user('1', ['ROLE_USER']);
        self::assertTrue($this->resolver($this->tokenFor($viewer))->isViewer($viewer, $subject));
    }

    public function testIsViewerRejectsAnotherUser(): void
    {
        $viewer = $this->user('1', ['ROLE_USER']);
        $subject = $this->user('2', ['ROLE_USER']);
        self::assertFalse($this->resolver($this->tokenFor($viewer))->isViewer($viewer, $subject));
    }

    private function resolver(?TokenInterface $token): UserIsGrantedResolver
    {
        $storage = $this->createStub(TokenStorageInterface::class);
        $storage->method('getToken')->willReturn($token);

        return new UserIsGrantedResolver($storage, $this->createStub(LoggerInterface::class));
    }

    private function tokenFor(User $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        return $token;
    }

    /** @param list<string> $roles */
    private function user(string $id, array $roles, ?string $organizationId = null): User
    {
        $user = (new User())->setId($id)->setRoles($roles);
        if (null !== $organizationId) {
            $organization = (new \Capco\AppBundle\Entity\Organization\Organization())->setId($organizationId);
            $member = (new \Capco\AppBundle\Entity\Organization\OrganizationMember())->setUser($user)->setOrganization($organization)->setRole('user');
            $organization->addMember($member);
            $user->addMemberOfOrganization($member);
        }

        return $user;
    }
}
