<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Security;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\Tests\IdentityWebTestCase;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Handler\CasHandler;
use Capco\UserBundle\Security\Service\CapebUserFilter;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises CAS entry and authorization through HTTP; replaces the external CAS and CAPEB gateways only.
 */
final class CasAuthenticationTest extends IdentityWebTestCase
{
    private ?string $casIdentifier = null;

    protected function tearDown(): void
    {
        try {
            if (null !== $this->casIdentifier && isset($this->em)) {
                $account = $this->em->getRepository(User::class)->findOneBy(['casId' => $this->casIdentifier]);
                if (null !== $account) {
                    self::getContainer()->get('snc_redis.default')->srem('recalculate_user_counters', [$account->getId()]);
                }
            }
        } finally {
            parent::tearDown();
        }
    }

    public function testCasReturnCreatesAnAccountAndKeepsTheRequestedLocalDestination(): void
    {
        $this->enableCas();
        $identifier = 'cas-return-' . bin2hex(random_bytes(8));
        $this->casIdentifier = $identifier;
        $gateway = $this->createStub(CasHandler::class);
        $gateway->method('login')->willReturnCallback(static function (string $destination) use ($identifier): RedirectResponse {
            // The external CAS gateway has accepted the ticket and returns its identity.
            self::getContainer()->get('session')->set('cas_login', $identifier);

            return new RedirectResponse($destination);
        });
        self::getContainer()->set(CasHandler::class, $gateway);

        $this->browser->request('GET', '/login-cas?ticket=provider-ticket&_destination=/projects');

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('/projects', $this->browser->getResponse()->headers->get('Location'));
        $viewer = $this->graphql('{ viewer { id username email } }')['viewer'];
        $this->em->clear();
        $account = $this->em->getRepository(User::class)->findOneBy(['casId' => $identifier]);
        self::assertInstanceOf(User::class, $account);
        self::assertSame($identifier, $account->getUsername());
        self::assertSame($identifier . '@fake-email-cap-collectif.com', $account->getEmail());
        self::assertTrue($account->isEnabled());
        self::assertSame(base64_encode('User:' . $account->getId()), $viewer['id']);
        self::assertSame($identifier, $viewer['username']);
        self::assertSame($account->getEmail(), $viewer['email']);
        self::assertCount(1, $account->getUserGroups());
        self::assertSame('CAS', $account->getUserGroups()->first()->getGroup()->getTitle());
        $this->assertViewer(true, $account->getId());
    }

    public function testEmptyCasIdentityIsRejectedWithoutCreatingOrLinkingAnAccount(): void
    {
        $this->enableCas();
        $account = $this->account();
        $id = $account->getId();
        $password = $account->getPassword();
        $this->casSession('');

        $this->browser->request('POST', '/graphql/internal', [], [], ['CONTENT_TYPE' => 'application/json'], '{"query":"{ viewer { id } }"}');

        self::assertSame(401, $this->browser->getResponse()->getStatusCode());
        self::assertSame(['message' => 'CAS Authentication Failed: An authentication exception occurred.'], json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR));
        $account = $this->reload($id);
        self::assertNull($account->getCasId());
        self::assertSame($password, $account->getPassword());
        self::assertCount(0, $account->getUserGroups());
        self::assertSame([], $this->em->getRepository(User::class)->findBy(['casId' => '']));
        $this->browser->getRequest()->getSession()->remove('cas_login');
        $this->browser->getRequest()->getSession()->save();
        $this->assertViewer(false);
    }

    /** @dataProvider disabledCasEntries */
    public function testDisabledCasEntryKeepsTheViewerAnonymousAndTheAccountUnchanged(bool $feature, bool $configuration, int $status): void
    {
        $this->enableCas();
        $this->setFeature('login_cas', $feature);
        $this->em->getRepository(CASSSOConfiguration::class)->findOneBy([])->setEnabled($configuration);
        $this->em->flush();
        $account = $this->account();
        $id = $account->getId();
        $email = $account->getEmail();
        $password = $account->getPassword();
        $gateway = $this->createMock(CasHandler::class);
        $gateway->expects(self::never())->method('login');
        self::getContainer()->set(CasHandler::class, $gateway);

        $this->browser->request('GET', '/login-cas?ticket=provider-ticket&_destination=/projects');

        self::assertSame($status, $this->browser->getResponse()->getStatusCode());
        if (302 === $status) {
            self::assertSame('/', $this->browser->getResponse()->headers->get('Location'));
        }
        $this->assertViewer(false);
        $account = $this->reload($id);
        self::assertSame($email, $account->getEmail());
        self::assertSame($password, $account->getPassword());
        self::assertNull($account->getCasId());
        self::assertCount(0, $account->getUserGroups());
    }

    /** @return iterable<string, array{bool, bool, int}> */
    public static function disabledCasEntries(): iterable
    {
        yield 'feature disabled' => [false, true, 404];
        yield 'configuration disabled' => [true, false, 302];
    }

    /** @dataProvider capebRoles */
    public function testCapebAuthorizationControlsAccountCreationAndUserType(?string $role): void
    {
        $this->enableCas();
        $identifier = 'capeb-' . bin2hex(random_bytes(8));
        $this->casIdentifier = $identifier;
        $neighbor = $this->account();
        $neighborId = $neighbor->getId();
        $neighborEmail = $neighbor->getEmail();
        $userType = null;
        if (null !== $role) {
            $userType = (new UserType())->setName('CAS ' . $role)->setSlug($identifier . '-' . $role)->setCreatedAt(new \DateTime('2026-10-05 10:00:00'));
            $this->em->persist($userType);
            $this->em->flush();
        }
        $expectedTypeId = $userType?->getId();
        $gateway = $this->createStub(CapebUserFilter::class);
        $gateway->method('getUserType')->willReturn($userType);
        self::getContainer()->set(CapebUserFilter::class, $gateway);
        $this->casSession($identifier);
        $originalInstance = getenv('SYMFONY_INSTANCE_NAME');
        putenv('SYMFONY_INSTANCE_NAME=capcapeb');

        try {
            $this->browser->request('POST', '/graphql/internal', [], [], ['CONTENT_TYPE' => 'application/json'], '{"query":"{ viewer { id } }"}');
        } finally {
            putenv(false === $originalInstance ? 'SYMFONY_INSTANCE_NAME' : 'SYMFONY_INSTANCE_NAME=' . $originalInstance);
        }

        $this->em->clear();
        $account = $this->em->getRepository(User::class)->findOneBy(['casId' => $identifier]);
        if (null === $role) {
            self::assertSame(403, $this->browser->getResponse()->getStatusCode());
            self::assertNull($account);
            $this->browser->getRequest()->getSession()->remove('cas_login');
            $this->browser->getRequest()->getSession()->save();
            $this->assertViewer(false);
        } else {
            self::assertSame(200, $this->browser->getResponse()->getStatusCode());
            self::assertInstanceOf(User::class, $account);
            self::assertSame($expectedTypeId, $account->getUserType()?->getId());
            self::assertSame($identifier, $account->getUsername());
            self::assertSame($identifier . '@fake-email-cap-collectif.com', $account->getEmail());
            self::assertCount(1, $account->getUserGroups());
            self::assertSame('CAS', $account->getUserGroups()->first()->getGroup()->getTitle());
            $this->assertViewer(true, $account->getId());
        }
        $neighbor = $this->reload($neighborId);
        self::assertSame($neighborEmail, $neighbor->getEmail());
        self::assertNull($neighbor->getCasId());
        self::assertCount(0, $neighbor->getUserGroups());
    }

    /** @return iterable<string, array{?string}> */
    public static function capebRoles(): iterable
    {
        yield 'authorized collaborator' => ['collaborator'];
        yield 'authorized elected representative' => ['elected'];
        yield 'refused external authorization' => [null];
    }

    private function enableCas(): void
    {
        $configuration = $this->em->getRepository(CASSSOConfiguration::class)->findOneBy([]) ?? new CASSSOConfiguration();
        $configuration->setEnabled(true);
        $this->em->persist($configuration);
        $this->em->flush();
        $this->setFeature('login_cas', true);
    }

    private function casSession(string $identifier): void
    {
        $session = self::getContainer()->get('session');
        $session->set('cas_login', $identifier);
        $session->save();
        $this->browser->getCookieJar()->set(new Cookie($session->getName(), $session->getId()));
    }
}
