<?php

namespace Capco\Tests\Processor\User;

use Capco\AppBundle\Processor\User\UserEmailProcessor;
use Capco\AppBundle\Processor\User\UserEmailReminderProcessor;
use Capco\AppBundle\Processor\User\UserPasswordProcessor;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Swarrot\Broker\Message;

/**
 * @internal
 * @coversNothing
 */
class UserProcessorTest extends MailerSnapshotCommandTestCase
{
    protected const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/__snapshots__';

    /**
     * @dataProvider snapshotScenarios
     *
     * @param class-string $processorClass
     */
    public function testProcessorEmailMatchesSnapshot(
        string $processorClass,
        string $userId,
        string $subject,
        string $snapshot
    ): void {
        $emails = $this->captureEmails();
        $this->processor($processorClass)->process($this->message($userId), []);
        $message = $emails->getMessageWithSubject($subject);

        if ('1' === getenv('UPDATE_EMAIL_SNAPSHOTS')) {
            $this->updateEmailSnapshot($message, $snapshot);
        }

        $this->assertEmailMatchesSnapshot($message, $snapshot);
    }

    /** @return iterable<string, array{class-string, string, string, string}> */
    public static function snapshotScenarios(): iterable
    {
        yield 'password change without locale' => [
            UserPasswordProcessor::class,
            'user515',
            'email.notification.password.change.subject',
            'confirmPasswordChange.html',
        ];
        yield 'password change with locale' => [
            UserPasswordProcessor::class,
            'user522',
            'email.notification.password.change.subject',
            'confirmPasswordChangeEnglish.html',
        ];
        yield 'email change without locale' => [
            UserEmailProcessor::class,
            'user515',
            'email.notification.email.change.subject',
            'confirmEmailChange.html',
        ];
        yield 'email change with locale' => [
            UserEmailProcessor::class,
            'user522',
            'email.notification.email.change.subject',
            'confirmEmailChangeEnglish.html',
        ];
        yield 'email confirmation reminder' => [
            UserEmailReminderProcessor::class,
            'user522',
            'email.alert_expire_user.subject',
            'remindUserAccountConfirmation.html',
        ];
    }

    /**
     * @param class-string $class
     */
    private function processor(string $class): object
    {
        $processor = self::getContainer()->get($class);
        self::assertIsObject($processor);

        return $processor;
    }

    private function message(string $userId): Message
    {
        return new Message(json_encode(['userId' => $userId], \JSON_THROW_ON_ERROR));
    }
}
