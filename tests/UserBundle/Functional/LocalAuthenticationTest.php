<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Functional;

use Capco\AppBundle\Anonymizer\UserAnonymizer;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Exercises account contracts through HTTP with fresh database reads, transactional cleanup and external boundary doubles.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class LocalAuthenticationTest extends AccountWebTestCase
{
    public function testLoginLogoutAndInvalidCredentials(): void
    {
        $user = $this->account();
        $email = $user->getEmail();
        $this->login($email, 'wrong-password', false);
        $this->login($this->uniqueEmail(), self::PASSWORD, false);
        $this->login($email);
        $this->logout();
    }

    /** @dataProvider accountStates */
    public function testCharacterizesLoginForAccountStates(string $state, bool $accepted, int $status, bool $sessionAccess): void
    {
        $user = $this->account();
        $email = $user->getEmail();
        if ('unconfirmed' === $state) {
            $user->setConfirmationToken(str_repeat('a', 43));
        } elseif ('deleted' === $state) {
            $user->setDeletedAccountAt(new \DateTime('2026-01-01 00:00:00 UTC'));
        } elseif ('anonymized' === $state) {
            self::getContainer()->get(UserAnonymizer::class)->anonymize($user);
        }
        $this->em->flush();
        $this->login($email, self::PASSWORD, $accepted, $status, $sessionAccess);
    }

    /** @return iterable<string, array{string, bool, int, bool}> */
    public static function accountStates(): iterable
    {
        yield 'confirmed' => ['confirmed', true, 200, true];
        yield 'unconfirmed' => ['unconfirmed', false, 200, false];
        yield 'deleted marker' => ['deleted', true, 200, false];
        yield 'anonymized' => ['anonymized', false, 401, false];
    }

    /** @dataProvider inactiveStates */
    public function testCharacterizationGapDisabledAndLockedAccountsCanLogin(string $state): void
    {
        $user = $this->account();
        if ('disabled' === $state) {
            $user->setEnabled(false);
        } else {
            $user->setLocked(true);
        }
        $this->em->flush();
        $this->login($user->getEmail());
    }

    /** @return iterable<string, array{string}> */
    public static function inactiveStates(): iterable
    {
        yield 'disabled' => ['disabled'];
        yield 'locked' => ['locked'];
    }

    public function testRegistrationPersistsCanonicalFieldsAndAllowsCanonicalEmailLogin(): void
    {
        $suffix = bin2hex(random_bytes(8));
        $canonicalEmail = 'mixedcase-' . $suffix . '@gmail.com';
        $user = $this->registerAccount('MixedCase-' . $suffix . '@gmail.com', 'MiXeD Username');
        $user = $this->reload($user->getId());
        self::assertSame($canonicalEmail, $user->getEmailCanonical());
        self::assertSame('mixed username', $user->getUsernameCanonical());
        $this->confirmAndLogin($user, $canonicalEmail);
    }

    /**
     * @dataProvider administrativeRoles
     *
     * @param list<string> $roles
     */
    public function testInheritedRolesControlAdministrativeAccess(array $roles, int $status): void
    {
        $user = $this->account();
        $user->setRoles($roles);
        $this->em->flush();
        $this->login($user->getEmail());
        $this->request('GET', '/admin/');
        self::assertSame($status, $this->browser->getResponse()->getStatusCode());
        if (301 === $status) {
            self::assertSame('/admin/dashboard', parse_url((string) $this->browser->getResponse()->headers->get('Location'), \PHP_URL_PATH));
        }
    }

    /** @return iterable<string, array{list<string>, int}> */
    public static function administrativeRoles(): iterable
    {
        yield 'default account roles' => [[], 403];
        yield 'ordinary account' => [['ROLE_USER'], 403];
        yield 'mediator' => [['ROLE_MEDIATOR'], 403];
        yield 'project administrator' => [['ROLE_PROJECT_ADMIN'], 403];
        yield 'administrator' => [['ROLE_ADMIN'], 301];
        yield 'duplicate administrator roles' => [['ROLE_ADMIN', 'ROLE_ADMIN', 'ROLE_USER'], 301];
        yield 'super administrator inherits administration' => [['ROLE_SUPER_ADMIN'], 301];
    }

    private function registerAccount(string $email, string $username): \Capco\UserBundle\Entity\User
    {
        $this->allowRegistrationWithoutCustomResponses();
        $payload = $this->graphql(
            'mutation($input: RegisterInput!) { register(input: $input) { user { id } errorsCode } }',
            ['input' => ['email' => $email, 'username' => $username, 'plainPassword' => self::PASSWORD, 'responses' => [], 'captcha' => 'test']]
        )['register'];
        self::assertNull($payload['errorsCode']);
        self::assertNotNull($payload['user']);
        $this->em->clear();
        $user = $this->em->getRepository(\Capco\UserBundle\Entity\User::class)->findOneBy(['email' => $email]);
        self::assertInstanceOf(\Capco\UserBundle\Entity\User::class, $user);
        self::assertSame(base64_encode('User:' . $user->getId()), $payload['user']['id']);

        return $user;
    }

    private function confirmAndLogin(\Capco\UserBundle\Entity\User $user, string $email): void
    {
        self::assertNotNull($user->getConfirmationToken());
        $this->request('GET', '/account/email_confirmation/' . $user->getConfirmationToken());
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $this->logout();
        $this->login($email);
    }
}
