<?php

namespace Capco\Tests\Processor\UserInvite;

use Capco\AppBundle\Processor\UserInvite\UserInviteNewInvitationProcessor;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Swarrot\Broker\Message;

/**
 * @internal
 * @coversNothing
 */
class UserInviteNewInvitationProcessorTest extends MailerSnapshotCommandTestCase
{
    protected const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/__snapshots__';

    public function testProcessorEmailMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $this->processor()->process($this->message(), []);
        $message = $emails->getMessageWithSubject('email-user-invitation-subject');

        if ('1' === getenv('UPDATE_EMAIL_SNAPSHOTS')) {
            $this->updateEmailSnapshot($message, 'userInvitation.html');
        }

        $this->assertEmailMatchesSnapshot($message, 'userInvitation.html');
    }

    private function processor(): UserInviteNewInvitationProcessor
    {
        $processor = self::getContainer()->get(UserInviteNewInvitationProcessor::class);
        self::assertInstanceOf(UserInviteNewInvitationProcessor::class, $processor);

        return $processor;
    }

    private function message(): Message
    {
        return new Message(json_encode(['id' => 'remEmailMessage'], \JSON_THROW_ON_ERROR));
    }
}
