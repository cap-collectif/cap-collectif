<?php

namespace Capco\Tests\Command;

/**
 * @internal
 * @coversNothing
 */
class DebateInvitationCommandTest extends MailerSnapshotCommandTestCase
{
    public function testSendsTestInvitationAndMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $commandTester = $this->createCommandTester('capco:debate:invite');

        $commandTester->execute([
            'debate' => 'debateCannabis',
            '--test-email' => 'maxime.pouessel@cap-collectif.com',
            '--test-token' => true,
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertCount(1, $emails->messages);

        $message = $emails->getMessageForRecipient('maxime.pouessel@cap-collectif.com');
        $this->assertEmailMetadata(
            $message,
            'maxime.pouessel@cap-collectif.com',
            'email-debate-launch-subject'
        );
        self::assertStringContainsString('debate-mail-lancement', $message->getBody());
        $this->assertEmailMatchesSnapshot($message, 'email_debate_test.html');
    }

    public function testSendsLaunchInvitationsAndMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $commandTester = $this->createCommandTester('capco:debate:invite');

        $commandTester->execute([
            'debate' => 'debateCannabis',
            '--test-token' => true,
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertCount(224, $emails->messages);

        $message = $emails->getMessageForRecipient('user@test.com');
        $this->assertEmailMetadata($message, 'user@test.com', 'email-debate-launch-subject');
        self::assertStringContainsString('debate-mail-lancement', $message->getBody());
        $this->assertEmailMatchesSnapshot($message, 'email_debate_launch.html');
    }

    public function testSendsDebateRemindersAndMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $commandTester = $this->createCommandTester('capco:debate:invite');

        $commandTester->execute([
            'debate' => 'debateCannabis',
            '--reminder' => true,
            '--test-token' => true,
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertCount(225, $emails->messages);

        $message = $emails->getMessageForRecipient('user@test.com');
        $this->assertEmailMetadata($message, 'user@test.com', 'email-debate-reminder-subject');
        self::assertStringContainsString('debate-mail-relance', $message->getBody());
        $this->assertEmailMatchesSnapshot($message, 'email_debate_reminder.html');
    }

    public function testSendsInvitationsInConsecutiveLimitedBatches(): void
    {
        $emails = $this->captureEmails();
        $commandTester = $this->createCommandTester('capco:debate:invite');

        foreach ([100, 200, 224] as $expectedSentEmails) {
            $commandTester->execute([
                'debate' => 'debateCannabis',
                '--test-token' => true,
                '--limit' => 100,
            ]);

            self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
            self::assertCount($expectedSentEmails, $emails->messages);
        }
    }
}
