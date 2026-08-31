<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;

/**
 * @internal
 * @coversNothing
 */
class RemindUserAccountConfirmationBeforeStepCloseCommandTest extends MailerSnapshotCommandTestCase
{
    public function testDoesNotSendRemindersWhenNoStepIsEnding(): void
    {
        $publishedMessages = $this->capturePublishedMessages();
        $commandTester = $this->createCommandTester(
            'capco:remind-user-account-confirmation-before-step-close'
        );

        $commandTester->execute(['--date' => '2031-09-28 22:05:00']);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString('No step ending between 49 and 48h.', $commandTester->getDisplay());
        self::assertStringContainsString('0 reminders sent !', $commandTester->getDisplay());
        self::assertSame([], $publishedMessages->messages);
    }

    public function testDoesNotSendRemindersWithoutUnpublishedContributions(): void
    {
        $publishedMessages = $this->capturePublishedMessages();
        $commandTester = $this->createCommandTester(
            'capco:remind-user-account-confirmation-before-step-close'
        );

        $commandTester->execute(['--date' => '2031-09-28 23:05:00']);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            'Une entreprise doit-elle offrir un oculus quest 2 à tous les salariés pour le confinement ? will end at 2031-10-01 00:00:00',
            $commandTester->getDisplay()
        );
        self::assertStringContainsString('3 unconfirmed users', $commandTester->getDisplay());
        self::assertStringContainsString(
            '0 have unpublished contribution in ending step',
            $commandTester->getDisplay()
        );
        self::assertStringContainsString('0 reminders sent !', $commandTester->getDisplay());
        self::assertSame([], $publishedMessages->messages);
    }

    public function testSendsRemindersForUnpublishedContributionsInEndingDebate(): void
    {
        $publishedMessages = $this->capturePublishedMessages();
        $commandTester = $this->createCommandTester(
            'capco:remind-user-account-confirmation-before-step-close'
        );

        $commandTester->execute(['--date' => '2060-09-28 23:05:00']);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            'Pour ou contre la légalisation du Cannabis ? will end at 2060-10-01 00:00:00',
            $commandTester->getDisplay()
        );
        self::assertStringContainsString(
            'send reminder to userNotConfirmedWithContributions@test.com',
            $commandTester->getDisplay()
        );
        self::assertStringContainsString(
            'send reminder to jeannine1957@laposte.fr',
            $commandTester->getDisplay()
        );
        self::assertStringContainsString('2 reminders sent !', $commandTester->getDisplay());

        $payloads = $publishedMessages->payloadsForType(
            CapcoAppBundleMessagesTypes::USER_STEP_REMINDER
        );
        self::assertSame(
            ['jeannine1957@laposte.fr', 'userNotConfirmedWithContributions@test.com'],
            $this->sortedEmails($payloads)
        );
        foreach ($payloads as $payload) {
            self::assertSame('Débat sur le cannabis', $payload['projectTitle']);
            self::assertArrayHasKey('username', $payload);
            self::assertStringContainsString('https://capco.dev/', $payload['confirmationUrl']);
        }
    }

    public function testSendsReminderWhenSelectionStepMeetsMinimumVotes(): void
    {
        $publishedMessages = $this->capturePublishedMessages();
        $commandTester = $this->createCommandTester(
            'capco:remind-user-account-confirmation-before-step-close'
        );

        $commandTester->execute(['--date' => '2029-12-29 23:05:00']);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            'Collecte avec vote classement limité will end at 2030-01-01 00:00:00',
            $commandTester->getDisplay()
        );
        self::assertStringContainsString(
            'send reminder to user_not_confirmed@test.com',
            $commandTester->getDisplay()
        );
        self::assertStringContainsString('1 reminders sent !', $commandTester->getDisplay());

        $payloads = $publishedMessages->payloadsForType(
            CapcoAppBundleMessagesTypes::USER_STEP_REMINDER
        );
        self::assertSame(['user_not_confirmed@test.com'], $this->sortedEmails($payloads));
        self::assertSame('BP avec vote classement', $payloads[0]['projectTitle']);
        self::assertStringContainsString('https://capco.dev/', $payloads[0]['confirmationUrl']);
    }

    /**
     * @param list<array<string, mixed>> $payloads
     *
     * @return list<string>
     */
    private function sortedEmails(array $payloads): array
    {
        $emails = array_column($payloads, 'email');
        sort($emails);

        return $emails;
    }
}
