<?php

namespace Capco\Tests\Processor\District;

use Capco\AppBundle\Processor\District\GlobalDistrictNotificationProcessor;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Swarrot\Broker\Message;

/**
 * @internal
 * @coversNothing
 */
class GlobalDistrictNotificationProcessorTest extends MailerSnapshotCommandTestCase
{
    protected const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/__snapshots__';

    public function testProcessorEmailMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $this->processor()->process($this->message(), []);
        $message = $emails->getMessageForRecipient('maxime.auriau@cap-collectif.com');

        $this->assertEmailMetadata(
            $message,
            'maxime.auriau@cap-collectif.com',
            'new-project-in-district'
        );

        if ('1' === getenv('UPDATE_EMAIL_SNAPSHOTS')) {
            $this->updateEmailSnapshot($message, 'projectDistrictNotification.html');
        }

        $this->assertEmailMatchesSnapshot($message, 'projectDistrictNotification.html');
    }

    private function processor(): GlobalDistrictNotificationProcessor
    {
        $processor = self::getContainer()->get(GlobalDistrictNotificationProcessor::class);
        self::assertInstanceOf(GlobalDistrictNotificationProcessor::class, $processor);

        return $processor;
    }

    private function message(): Message
    {
        return new Message(json_encode([
            'projectId' => 'project2',
            'globalDistrict' => 'globalDistrict7',
        ], \JSON_THROW_ON_ERROR));
    }
}
