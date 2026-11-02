<?php

declare(strict_types=1);

namespace Capco\Tests\Controller\Api;

use Capco\Tests\IdentityWebTestCase;
use Capco\UserBundle\Entity\User;

/**
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises the shield through HTTP with persisted roles, explicit responses and isolated accounts.
 *
 * @internal
 */
final class PlatformAccessTest extends IdentityWebTestCase
{
    public static function featureFlagOverrides(): array
    {
        return [...parent::featureFlagOverrides(), 'shield_mode' => true, 'shield_authorized_users_only' => true];
    }

    public function testAnonymousVisitorStillSeesTheExistingShield(): void
    {
        $this->browser->request('GET', '/');
        self::assertResponseIsSuccessful();
        self::assertStringContainsString('id="shield-mode"', (string) $this->browser->getResponse()->getContent());
        self::assertStringContainsString('ShieldApp', (string) $this->browser->getResponse()->getContent());
        $this->graphql('{ projects { totalCount } }');
    }

    public function testDeniedUserKeepsGraphqlAndLogoutAccess(): void
    {
        $this->browser->loginUser($this->account());
        $this->browser->request('GET', '/');
        self::assertResponseStatusCodeSame(403);
        self::assertStringContainsString('id="shield-mode"', (string) $this->browser->getResponse()->getContent());
        $shieldProps = $this->browser->getCrawler()->filter('script[data-component-name="ShieldApp"]');
        self::assertCount(1, $shieldProps);
        $props = json_decode($shieldProps->text(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertTrue($props['accessDenied']);
        $this->graphql('{ viewer { id } projects { totalCount } }');
        $this->browser->request('GET', '/logout');
        self::assertTrue($this->browser->getResponse()->isRedirection());
    }

    /** @dataProvider allowedRoles */
    public function testAuthorizedUsersPassTheShield(string $role): void
    {
        $user = $this->account();
        $user->addRole($role);
        $this->em->flush();
        $this->browser->loginUser($user);
        $this->browser->request('GET', '/');
        self::assertResponseIsSuccessful();
        self::assertStringNotContainsString('id="shield-mode"', (string) $this->browser->getResponse()->getContent());
    }

    /** @return iterable<string, array{string}> */
    public static function allowedRoles(): iterable
    {
        yield 'authorized user' => ['ROLE_SHIELD_AUTHORIZED_USER'];

        yield 'admin inherits access' => ['ROLE_ADMIN'];

        yield 'super-admin inherits access' => ['ROLE_SUPER_ADMIN'];
    }

    public function testRevocationAppliesToAnExistingSession(): void
    {
        $user = $this->account();
        $user->addRole('ROLE_SHIELD_AUTHORIZED_USER');
        $this->em->flush();
        $this->browser->loginUser($user);
        $this->browser->request('GET', '/');
        self::assertResponseIsSuccessful();
        $sessionUser = self::getContainer()->get('security.token_storage')->getToken()?->getUser();
        self::assertInstanceOf(User::class, $sessionUser);

        // Revoke access on a separate instance, leaving the authenticated user's snapshot intact.
        $updatedUser = $this->reload($user->getId());
        self::assertNotSame($sessionUser, $updatedUser);
        $updatedUser->removeRole('ROLE_SHIELD_AUTHORIZED_USER');
        $this->em->flush();
        $this->em->clear();
        self::assertContains('ROLE_SHIELD_AUTHORIZED_USER', $sessionUser->getRoles());
        $this->browser->request('GET', '/');
        self::assertResponseStatusCodeSame(403);
        $this->assertViewer(true, $user->getId());
    }

    public function testDisablingShieldPreservesTheRestrictionSetting(): void
    {
        $this->browser->loginUser($this->account());
        $this->setFeatureFlags(['shield_mode' => false]);
        $this->browser->request('GET', '/');
        self::assertResponseIsSuccessful();
        self::assertStringNotContainsString('id="shield-mode"', (string) $this->browser->getResponse()->getContent());
        $flags = $this->graphql('{ featureFlags { type enabled } }')['featureFlags'];
        self::assertTrue(array_column($flags, 'enabled', 'type')['shield_authorized_users_only']);
        $this->setFeatureFlags(['shield_mode' => true]);
        $this->browser->request('GET', '/');
        self::assertResponseStatusCodeSame(403);
    }

    public function testShieldWithoutRoleRestrictionAllowsOrdinaryUsers(): void
    {
        $this->setFeatureFlags(['shield_authorized_users_only' => false]);
        $this->browser->loginUser($this->account());
        $this->browser->request('GET', '/');
        self::assertResponseIsSuccessful();
        self::assertStringNotContainsString('id="shield-mode"', (string) $this->browser->getResponse()->getContent());
    }

    public function testMediaStillReachesItsExistingHandler(): void
    {
        $this->browser->loginUser($this->account());
        $this->browser->request('GET', '/media/default/0001/01/not-a-file.jpg');
        self::assertResponseStatusCodeSame(404);
    }

    /** @dataProvider passwordResetRoles */
    public function testPasswordResetRemainsAvailableBehindTheShield(bool $authorized, bool $authenticated): void
    {
        $user = $this->account();
        if ($authorized) {
            $user->addRole('ROLE_SHIELD_AUTHORIZED_USER');
        }
        $id = $user->getId();
        $roles = $user->getRoles();
        $this->em->flush();
        if ($authenticated) {
            $this->browser->loginUser($user);
        }

        $this->browser->request('GET', '/resetting/request');
        self::assertResponseIsSuccessful();
        self::assertSelectorNotExists('script[data-component-name="NavbarApp"]');
        $this->browser->request('POST', '/resetting/send-email', ['email' => $user->getEmail()]);
        self::assertResponseRedirects('/resetting/check-email');
        $this->browser->followRedirect();
        self::assertResponseIsSuccessful();
        self::assertSelectorNotExists('script[data-component-name="NavbarApp"]');
        $token = $this->reload($id)->getResetPasswordToken();
        self::assertNotNull($token);
        $this->browser->request('GET', '/resetting/reset/' . $token);
        self::assertResponseIsSuccessful();
        self::assertSelectorExists('script[data-component-name="ResetPasswordApp"]');
        self::assertSelectorNotExists('script[data-component-name="NavbarApp"]');

        $payload = $this->graphql(
            'mutation($input: ResetPasswordInput!) { resetPassword(input: $input) { user { id } error } }',
            ['input' => ['token' => $token, 'password' => 'Changed456!']]
        )['resetPassword'];
        self::assertNull($payload['error']);
        $updated = $this->reload($id);
        self::assertTrue(password_verify('Changed456!', (string) $updated->getPassword()));
        self::assertSame($roles, $updated->getRoles());
        $this->browser->request('GET', '/');
        self::assertResponseStatusCodeSame($authorized ? 200 : 403);
    }

    /** @return iterable<string, array{bool, bool}> */
    public static function passwordResetRoles(): iterable
    {
        yield 'ordinary user, signed out' => [false, false];

        yield 'authorized user, signed out' => [true, false];

        yield 'ordinary user, signed in' => [false, true];

        yield 'authorized user, signed in' => [true, true];
    }

    public function testPasswordRecoveryKeepsNavigationWhenTheShieldIsDisabled(): void
    {
        $this->setFeatureFlags(['shield_mode' => false]);
        $this->browser->request('GET', '/resetting/request');
        self::assertResponseIsSuccessful();
        self::assertSelectorExists('script[data-component-name="NavbarApp"]');
    }
}
