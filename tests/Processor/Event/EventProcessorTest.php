<?php

namespace Capco\Tests\Processor\Event;

use Capco\AppBundle\Processor\Event\EventCreateProcessor;
use Capco\AppBundle\Processor\Event\EventDeleteProcessor;
use Capco\AppBundle\Processor\Event\EventReviewProcessor;
use Capco\AppBundle\Processor\Event\EventUpdateProcessor;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Swarrot\Broker\Message;

/**
 * @internal
 * @coversNothing
 */
class EventProcessorTest extends MailerSnapshotCommandTestCase
{
    protected const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/__snapshots__';

    /**
     * @dataProvider snapshotScenarios
     *
     * @param class-string         $processorClass
     * @param array<string, mixed> $payload
     */
    public function testProcessorEmailMatchesSnapshot(
        string $processorClass,
        array $payload,
        string $recipient,
        string $subject,
        string $snapshot
    ): void {
        $emails = $this->captureEmails();
        $this->process($processorClass, $this->message($payload));
        $message = $emails->getMessageForRecipient($recipient);

        self::assertStringContainsString($subject, $message->getSubject());

        if ('1' === getenv('UPDATE_EMAIL_SNAPSHOTS')) {
            $this->updateEmailSnapshot($message, $snapshot);
        }

        $this->assertEmailMatchesSnapshot($message, $snapshot);
    }

    /** @return iterable<string, array{class-string, array<string, mixed>, string, string, string}> */
    public static function snapshotScenarios(): iterable
    {
        yield 'new event for administrators' => [
            EventCreateProcessor::class,
            ['eventId' => 'event5'],
            'dev@cap-collectif.com',
            'event-needing-examination-new',
            'notifyAdminOfNewEvent.html',
        ];
        yield 'updated event for administrators' => [
            EventUpdateProcessor::class,
            ['eventId' => 'event5'],
            'dev@cap-collectif.com',
            'event-needing-examination-new',
            'notifyAdminOfEditedEvent.html',
        ];
        yield 'deleted event for administrators' => [
            EventDeleteProcessor::class,
            self::deletedEventPayload(),
            'dev@cap-collectif.com',
            'event-deleted-notification-new',
            'notifyAdminOfDeletedEvent.html',
        ];
        yield 'deleted event for participant' => [
            EventDeleteProcessor::class,
            self::deletedEventPayload(),
            'lbrunet@cap-collectif.com',
            'event-canceled-notification-new',
            'notifyParticipantOfDeletedEvent.html',
        ];
        yield 'deleted event for registered participant' => [
            EventDeleteProcessor::class,
            self::deletedEventPayload(),
            'toto@tata.fr',
            'event-canceled-notification-new',
            'notifyRegisteredParticipantOfDeletedEvent.html',
        ];
        yield 'approved event review' => [
            EventReviewProcessor::class,
            ['eventId' => 'eventCreateByAUserReviewApproved'],
            'user@test.com',
            'event-approved-new',
            'notifyUserReviewedEventApproved.html',
        ];
        yield 'approved English event review' => [
            EventReviewProcessor::class,
            ['eventId' => 'eventCreateByAUserReviewApprovedEn'],
            'john.smith@england.uk',
            'event-approved-new',
            'notifyUserReviewedEventApprovedEnglish.html',
        ];
        yield 'refused event review' => [
            EventReviewProcessor::class,
            ['eventId' => 'eventCreateByAUserReviewRefused'],
            'user@test.com',
            'event-refused-new',
            'notifyUserReviewedEventRefused.html',
        ];
        yield 'refused English event review' => [
            EventReviewProcessor::class,
            ['eventId' => 'eventCreateByAUserReviewRefusedEn'],
            'john.smith@england.uk',
            'event-refused-new',
            'notifyUserReviewedEventRefusedEnglish.html',
        ];
    }

    /** @return array<string, mixed> */
    private static function deletedEventPayload(): array
    {
        return [
            'eventId' => 'event1',
            'eventParticipants' => [
                [
                    'email' => 'lbrunet@cap-collectif.com',
                    'username' => 'lbrunet',
                ],
                [
                    'email' => 'user@test.com',
                    'username' => 'test',
                ],
                [
                    'email' => '',
                    'username' => '',
                    'u_username' => 'registeredUser',
                    'u_email' => 'toto@tata.fr',
                ],
            ],
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

    /** @param class-string $class */
    private function process(string $class, Message $message): void
    {
        ob_start();

        try {
            $this->processor($class)->process($message, []);
        } finally {
            ob_end_clean();
        }
    }

    /** @param array<string, mixed> $payload */
    private function message(array $payload): Message
    {
        return new Message(json_encode($payload, \JSON_THROW_ON_ERROR));
    }
}
