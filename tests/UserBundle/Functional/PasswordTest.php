<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Functional;

use Capco\UserBundle\Entity\User;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Exercises account contracts through HTTP with fresh database reads, transactional cleanup and external boundary doubles.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class PasswordTest extends AccountWebTestCase
{
    private const CHANGE = 'mutation($input: UpdateProfilePasswordInput!) { updateProfilePassword(input: $input) { user { id } error } }';
    private const RESET = 'mutation($input: ResetPasswordInput!) { resetPassword(input: $input) { user { id } error } }';
    private const NEW_PASSWORD = 'Changed456!';

    public function testPasswordChangeUsesRealValidationAndHashing(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $this->login($email);
        $payload = $this->change(self::PASSWORD, self::NEW_PASSWORD);
        self::assertNull($payload['error']);
        self::assertTrue(password_verify(self::NEW_PASSWORD, (string) $this->reload($id)->getPassword()));
        self::assertSame([['type' => 'user.password', 'body' => ['userId' => $id]]], $this->messages);
        $this->logout();
        $this->login($email, self::PASSWORD, false);
        $this->login($email, self::NEW_PASSWORD);
    }

    /** @dataProvider invalidPasswordChanges */
    public function testRejectedPasswordChangeKeepsPersistedHash(string $current, string $new): void
    {
        $user = $this->account();
        $id = $user->getId();
        $hash = $user->getPassword();
        $this->login($user->getEmail());
        // The current API exposes the same message for both validation failures.
        $payload = $this->change($current, $new);
        self::assertSame('fos_user.password.not_current', $payload['error']);
        self::assertSame(base64_encode('User:' . $id), $payload['user']['id']);
        self::assertSame($hash, $this->reload($id)->getPassword());
        self::assertSame([], $this->messages);
    }

    /** @return iterable<string, array{string, string}> */
    public static function invalidPasswordChanges(): iterable
    {
        yield 'wrong current password' => ['wrong', self::NEW_PASSWORD];
        yield 'invalid new password' => [self::PASSWORD, 'weak'];
    }

    public function testResetRequestsHideUnknownEmailAndThrottleRepeatedEmail(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $this->mailer->expects(self::once())->method('createAndSendMessage');
        $this->request('POST', '/resetting/send-email', ['email' => $email]);
        $knownLocation = $this->browser->getResponse()->headers->get('Location');
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $user = $this->reload($id);
        self::assertNotNull($user->getResetPasswordToken());
        self::assertNotNull($user->getPasswordRequestedAt());
        $token = $user->getResetPasswordToken();
        $requestedAt = $user->getPasswordRequestedAt();
        $this->request('POST', '/resetting/send-email', ['email' => $email]);
        self::assertSame($knownLocation, $this->browser->getResponse()->headers->get('Location'));
        $user = $this->reload($id);
        self::assertSame($token, $user->getResetPasswordToken());
        self::assertEquals($requestedAt, $user->getPasswordRequestedAt());
        $this->request('POST', '/resetting/send-email', ['email' => $this->uniqueEmail()]);
        self::assertSame($knownLocation, $this->browser->getResponse()->headers->get('Location'));
    }

    public function testCharacterizationGapExpiredResetRequestReusesToken(): void
    {
        $user = $this->resetAccount();
        $id = $user->getId();
        $token = $user->getResetPasswordToken();
        $user->setPasswordRequestedAt(new \DateTime('2000-01-01 00:00:00 UTC'));
        $this->em->flush();
        $this->mailer->expects(self::once())->method('createAndSendMessage');
        $beforeRequest = new \DateTimeImmutable();
        $this->request('POST', '/resetting/send-email', ['email' => $user->getEmail()]);
        $afterRequest = new \DateTimeImmutable();
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $user = $this->reload($id);
        self::assertSame($token, $user->getResetPasswordToken());
        self::assertNotNull($user->getPasswordRequestedAt());
        self::assertGreaterThanOrEqual($beforeRequest->getTimestamp(), $user->getPasswordRequestedAt()->getTimestamp());
        self::assertLessThanOrEqual($afterRequest->getTimestamp(), $user->getPasswordRequestedAt()->getTimestamp());
    }

    public function testGraphqlResetConfirmsAnUnconfirmedAccount(): void
    {
        $user = $this->resetAccount();
        $id = $user->getId();
        $email = $user->getEmail();
        $user->setConfirmationToken(str_repeat('a', 43));
        $user->setEnabled(false);
        $this->em->flush();
        self::assertNull($this->reset($user->getResetPasswordToken(), self::NEW_PASSWORD)['error']);
        $user = $this->reload($id);
        self::assertTrue($user->isEnabled());
        self::assertTrue($user->isEmailConfirmed());
        self::assertNotNull($user->getConfirmedAccountAt());
        $this->logout();
        $this->login($email, self::NEW_PASSWORD);
    }

    /** @dataProvider rejectedResets */
    public function testRejectedResetDoesNotChangeAccount(bool $unknownToken, string $password, string $error): void
    {
        $user = $this->resetAccount();
        $id = $user->getId();
        $user = $this->reload($id);
        $hash = $user->getPassword();
        $token = $user->getResetPasswordToken();
        $requestedAt = $user->getPasswordRequestedAt();
        $this->mailer->expects(self::never())->method('createAndSendMessage');
        self::assertSame($error, $this->reset($unknownToken ? 'unknown-token' : $token, $password)['error']);
        $this->assertViewer(false);
        self::assertSame([], $this->messages);
        $user = $this->reload($id);
        self::assertSame($hash, $user->getPassword());
        self::assertSame($token, $user->getResetPasswordToken());
        self::assertEquals($requestedAt, $user->getPasswordRequestedAt());
    }

    /** @return iterable<string, array{bool, string, string}> */
    public static function rejectedResets(): iterable
    {
        yield 'unknown token' => [true, self::NEW_PASSWORD, 'The user with "confirmation token" does not exist for value "unknown-token"'];
        yield 'invalid password' => [false, 'weak', 'Form not valid.'];
    }

    public function testHttpResetRejectsUnknownTokenWithoutAuthenticating(): void
    {
        $this->request('GET', '/resetting/reset/unknown-token');
        self::assertSame(404, $this->browser->getResponse()->getStatusCode());
        $this->assertViewer(false);
    }

    public function testCharacterizationGapGraphqlAcceptsExpiredAndReplayedResetToken(): void
    {
        $user = $this->resetAccount();
        $user->setPasswordRequestedAt(new \DateTime('2000-01-01 00:00:00 UTC'));
        $this->em->flush();
        $id = $user->getId();
        $email = $user->getEmail();
        $token = $user->getResetPasswordToken();
        $this->request('GET', '/resetting/reset/' . $token);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        self::assertSame('/resetting/request', parse_url((string) $this->browser->getResponse()->headers->get('Location'), \PHP_URL_PATH));
        self::assertNull($this->reset($token, self::NEW_PASSWORD)['error']);
        self::assertSame($token, $this->reload($id)->getResetPasswordToken());
        self::assertNull($this->reset($token, 'Replayed789!')['error']);
        $this->logout();
        $this->login($email, 'Replayed789!');
    }

    public function testCharacterizationGapHttpResetHashesPasswordButKeepsTokenReplayable(): void
    {
        $user = $this->resetAccount();
        $id = $user->getId();
        $email = $user->getEmail();
        $token = $user->getResetPasswordToken();
        $this->submitHttpReset($token, self::NEW_PASSWORD);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        self::assertTrue(password_verify(self::NEW_PASSWORD, (string) $this->reload($id)->getPassword()));
        self::assertSame($token, $this->reload($id)->getResetPasswordToken());
        $this->submitHttpReset($token, 'Replayed789!');
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $this->logout();
        $this->login($email, 'Replayed789!');
    }

    public function testCharacterizationGapSecondSessionSurvivesPasswordChange(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $this->login($email);
        $firstSessionId = $this->browser->getRequest()->getSession()->getId();
        $firstCookies = $this->browser->getCookieJar()->all();
        $this->selectSession([]);
        $this->login($email);
        self::assertNotSame($firstSessionId, $this->browser->getRequest()->getSession()->getId());
        self::assertNull($this->change(self::PASSWORD, self::NEW_PASSWORD)['error']);
        $this->selectSession($firstCookies);
        $this->assertViewer(true, $id);
    }

    public function testSecondSessionIsInvalidatedAfterAccountAnonymization(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $this->login($email);
        $firstSessionId = $this->browser->getRequest()->getSession()->getId();
        $firstCookies = $this->browser->getCookieJar()->all();
        $this->selectSession([]);
        $this->login($email);
        self::assertNotSame($firstSessionId, $this->browser->getRequest()->getSession()->getId());
        $payload = $this->graphql('mutation { deleteAccount(input: {type: SOFT}) { errorCode userId } }')['deleteAccount'];
        self::assertNull($payload['errorCode']);
        self::assertSame(base64_encode('User:' . $id), $payload['userId']);
        self::assertNull($this->reload($id)->getEmail());
        $this->selectSession($firstCookies);
        $this->assertViewer(false);
        $this->login($email, self::PASSWORD, false);
    }

    /** @param array<\Symfony\Component\BrowserKit\Cookie> $cookies */
    private function selectSession(array $cookies): void
    {
        // With a shared kernel, reset the session ID so the listener reads this browser's cookies.
        $session = $this->browser->getRequest()->getSession();
        if ($session->isStarted()) {
            $session->save();
        }
        $session->setId('');
        $this->browser->getCookieJar()->clear();
        foreach ($cookies as $cookie) {
            $this->browser->getCookieJar()->set($cookie);
        }
    }

    /** @return array<string, mixed> */
    private function change(string $current, string $new): array
    {
        return $this->graphql(self::CHANGE, ['input' => ['current_password' => $current, 'new_password' => $new]])['updateProfilePassword'];
    }

    /** @return array<string, mixed> */
    private function reset(string $token, string $password): array
    {
        return $this->graphql(self::RESET, ['input' => ['token' => $token, 'password' => $password]])['resetPassword'];
    }

    private function resetAccount(): User
    {
        $user = $this->account();
        $user->setResetPasswordToken(bin2hex(random_bytes(16)));
        $user->setPasswordRequestedAt(new \DateTime());
        $this->em->flush();

        return $user;
    }

    private function submitHttpReset(string $token, string $password): void
    {
        $this->request('GET', '/resetting/reset/' . $token);
        self::assertSame(200, $this->browser->getResponse()->getStatusCode());
        // The page renders React rather than a form, so obtain the real form's CSRF token.
        $stack = self::getContainer()->get('request_stack');
        $stack->push($this->browser->getRequest());

        try {
            $csrfToken = self::getContainer()->get('security.csrf.token_manager')->getToken('recreate_password_form')->getValue();
            $this->browser->getRequest()->getSession()->save();
        } finally {
            $stack->pop();
        }
        $this->request('POST', '/resetting/reset/' . $token, [
            'recreate_password_form' => ['_token' => $csrfToken, 'plainPassword' => ['first' => $password, 'second' => $password]],
        ]);
    }
}
