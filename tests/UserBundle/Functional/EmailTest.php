<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Functional;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Exercises account contracts through HTTP with fresh database reads, transactional cleanup and external boundary doubles.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class EmailTest extends AccountWebTestCase
{
    private const CHANGE = 'mutation($input: UpdateProfileAccountEmailInput!) { updateProfileAccountEmail(input: $input) { viewer { id } error } }';
    private const RESEND = 'mutation { resendEmailConfirmation { errorCode } }';

    public function testEmailChangeKeepsOldEmailUntilConfirmationAndConsumesToken(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $oldEmail = $user->getEmail();
        $newEmail = $this->uniqueEmail();
        $this->login($oldEmail);
        self::assertNull($this->change($newEmail)['error']);
        $user = $this->reload($id);
        self::assertSame($oldEmail, $user->getEmail());
        self::assertSame($newEmail, $user->getNewEmailToConfirm());
        $token = $user->getNewEmailConfirmationToken();
        self::assertNotNull($token);
        $this->request('GET', '/account/new_email_confirmation/' . $token);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $user = $this->reload($id);
        self::assertSame($newEmail, $user->getEmail());
        self::assertSame($newEmail, $user->getEmailCanonical());
        self::assertNull($user->getNewEmailToConfirm());
        self::assertNull($user->getNewEmailConfirmationToken());
        $this->request('GET', '/account/new_email_confirmation/' . $token);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        self::assertSame($newEmail, $this->reload($id)->getEmail());
        $this->logout();
        $this->login($oldEmail, self::PASSWORD, false);
        $this->login($newEmail);
    }

    public function testAnotherEmailChangeRotatesPendingToken(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $oldEmail = $user->getEmail();
        $this->login($oldEmail);
        self::assertNull($this->change($this->uniqueEmail())['error']);
        $firstToken = $this->reload($id)->getNewEmailConfirmationToken();
        $newEmail = $this->uniqueEmail();
        self::assertNull($this->change($newEmail)['error']);
        $user = $this->reload($id);
        $secondToken = $user->getNewEmailConfirmationToken();
        self::assertNotNull($secondToken);
        self::assertNotSame($firstToken, $secondToken);
        $this->request('GET', '/account/new_email_confirmation/' . $firstToken);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $user = $this->reload($id);
        self::assertSame($oldEmail, $user->getEmail());
        self::assertSame($newEmail, $user->getNewEmailToConfirm());
        self::assertSame($secondToken, $user->getNewEmailConfirmationToken());
        $this->request('GET', '/account/new_email_confirmation/' . $secondToken);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        self::assertSame($newEmail, $this->reload($id)->getEmail());
    }

    /** @dataProvider rejectedChanges */
    public function testRejectedEmailChangeHasNoPersistedOrOutboundEffect(bool $emailAlreadyUsed, string $password, string $error): void
    {
        $owner = $this->account();
        $ownerId = $owner->getId();
        $usedEmail = $owner->getEmail();
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $this->login($email);
        $this->mailer->expects(self::never())->method('createAndSendMessage');
        self::assertSame($error, $this->change($emailAlreadyUsed ? $usedEmail : $this->uniqueEmail(), $password)['error']);
        $user = $this->reload($id);
        self::assertSame($email, $user->getEmail());
        self::assertNull($user->getNewEmailToConfirm());
        self::assertNull($user->getNewEmailConfirmationToken());
        self::assertSame($usedEmail, $this->reload($ownerId)->getEmail());
        self::assertSame([], $this->messages);
    }

    /** @return iterable<string, array{bool, string, string}> */
    public static function rejectedChanges(): iterable
    {
        yield 'wrong password' => [false, 'wrong', 'SPECIFY_PASSWORD'];
        yield 'email belongs to another account' => [true, self::PASSWORD, 'ALREADY_USED_EMAIL'];
    }

    public function testInvalidNewEmailConfirmationLeavesPendingChangeUntouched(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $newEmail = $this->uniqueEmail();
        $user->setNewEmailToConfirm($newEmail);
        $user->setNewEmailConfirmationToken('pending-token');
        $this->em->flush();
        $this->request('GET', '/account/new_email_confirmation/unknown-token');
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $user = $this->reload($id);
        self::assertSame($email, $user->getEmail());
        self::assertSame($newEmail, $user->getNewEmailToConfirm());
        self::assertSame('pending-token', $user->getNewEmailConfirmationToken());
        $this->assertViewer(false);
    }

    public function testResendRejectsConfirmedAccount(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $this->mailer->expects(self::never())->method('createAndSendMessage');
        $this->login($user->getEmail());
        self::assertSame('EMAIL_ALREADY_CONFIRMED', $this->resend());
        self::assertSame([], $this->messages);
        $user = $this->reload($id);
        self::assertTrue($user->isEmailConfirmed());
        self::assertNull($user->getEmailConfirmationSentAt());
    }

    public function testResendConfirmationPersistsTimestampAndRejectsImmediateRetry(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $this->login($user->getEmail());
        $user = $this->reload($id);
        $user->setConfirmationToken(str_repeat('a', 43));
        $this->em->flush();
        $this->mailer->expects(self::once())->method('createAndSendMessage');
        self::assertNull($this->resend());
        $user = $this->reload($id);
        $sentAt = $user->getEmailConfirmationSentAt();
        $token = $user->getConfirmationToken();
        self::assertNotNull($sentAt);
        self::assertSame('EMAIL_RECENTLY_SENT', $this->resend());
        $user = $this->reload($id);
        self::assertEquals($sentAt, $user->getEmailConfirmationSentAt());
        self::assertSame($token, $user->getConfirmationToken());
        self::assertSame([], $this->messages);
    }

    public function testResendPendingEmailChangePublishesMessageAndPersistsTimestamp(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $user->setNewEmailToConfirm($this->uniqueEmail());
        $user->setNewEmailConfirmationToken('pending-token');
        $this->em->flush();
        $this->mailer->expects(self::never())->method('createAndSendMessage');
        $this->login($user->getEmail());
        self::assertNull($this->resend());
        self::assertContains(['type' => 'user.email', 'body' => ['userId' => $id]], $this->messages);
        self::assertNotNull($this->reload($id)->getEmailConfirmationSentAt());
    }

    /** @return array<string, mixed> */
    private function change(string $email, string $password = self::PASSWORD): array
    {
        return $this->graphql(self::CHANGE, ['input' => ['email' => $email, 'passwordConfirm' => $password]])['updateProfileAccountEmail'];
    }

    private function resend(): ?string
    {
        return $this->graphql(self::RESEND)['resendEmailConfirmation']['errorCode'];
    }
}
