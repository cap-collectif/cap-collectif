<?php

namespace Capco\Tests\Processor\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Notifier\OpinionNotifier;
use Capco\AppBundle\Processor\Opinion\OpinionCreateProcessor;
use Capco\AppBundle\Processor\Opinion\OpinionTrashProcessor;
use Capco\AppBundle\Processor\Opinion\OpinionUpdateProcessor;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Swarrot\Broker\Message;

/**
 * @internal
 * @coversNothing
 */
class OpinionProcessorTest extends MailerSnapshotCommandTestCase
{
    protected const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/__snapshots__';

    /**
     * @dataProvider delegationScenarios
     *
     * @param class-string $processorClass
     */
    public function testProcessorDelegatesToNotifier(
        string $processorClass,
        string $method,
        string $opinionId
    ): void {
        $opinion = $this->createStub(Opinion::class);
        $repository = $this->createMock(OpinionRepository::class);
        $repository->expects(self::once())->method('find')->with($opinionId)->willReturn($opinion);
        $notifier = $this->createMock(OpinionNotifier::class);
        $notifier->expects(self::once())->method($method)->with($opinion);

        $processor = new $processorClass($repository, $notifier);

        self::assertTrue($processor->process($this->message($opinionId), []));
    }

    /** @return iterable<string, array{class-string, string, string}> */
    public static function delegationScenarios(): iterable
    {
        yield 'creation with moderation enabled' => [OpinionCreateProcessor::class, 'onCreation', 'opinion60'];
        yield 'creation with moderation disabled' => [OpinionCreateProcessor::class, 'onCreation', 'opinion1'];
        yield 'update with moderation enabled' => [OpinionUpdateProcessor::class, 'onUpdate', 'opinion60'];
        yield 'update with moderation disabled' => [OpinionUpdateProcessor::class, 'onUpdate', 'opinion1'];
        yield 'trash French author' => [OpinionTrashProcessor::class, 'onTrash', 'opinion63'];
        yield 'trash English author' => [OpinionTrashProcessor::class, 'onTrash', 'opinion226'];
    }

    /**
     * @dataProvider snapshotScenarios
     *
     * @param class-string $processorClass
     */
    public function testProcessorEmailMatchesSnapshot(
        string $processorClass,
        string $opinionId,
        string $recipient,
        string $subject,
        string $snapshot
    ): void {
        $emails = $this->captureEmails();
        $this->processor($processorClass)->process($this->message($opinionId), []);
        $message = $emails->getMessageForRecipient($recipient);

        self::assertStringContainsString($subject, $message->getSubject());

        if ('1' === getenv('UPDATE_EMAIL_SNAPSHOTS')) {
            file_put_contents(
                static::EMAIL_SNAPSHOT_DIRECTORY . '/' . $snapshot,
                $this->getSnapshotBody($message)
            );
        }

        $this->assertEmailMatchesSnapshot($message, $snapshot);
    }

    /** @return iterable<string, array{class-string, string, string, string, string}> */
    public static function snapshotScenarios(): iterable
    {
        yield 'new opinion moderation' => [
            OpinionCreateProcessor::class,
            'opinion60',
            'dev@cap-collectif.com',
            'notification-subject-new-proposal',
            'createOnpinionModeration.html',
        ];
        yield 'updated opinion moderation' => [
            OpinionUpdateProcessor::class,
            'opinion60',
            'dev@cap-collectif.com',
            'notification-subject-modified-proposal',
            'updateOnpinionModeration.html',
        ];
        yield 'trashed English opinion' => [
            OpinionTrashProcessor::class,
            'opinion226',
            'john.smith@england.uk',
            'notification-subject-proposal-in-the-trash',
            'trashedOpinionAuthorEnglish.html',
        ];
    }

    /**
     * @dataProvider disabledModerationScenarios
     *
     * @param class-string $processorClass
     */
    public function testDisabledModerationDoesNotSendEmail(string $processorClass, string $opinionId): void
    {
        $emails = $this->captureEmails();
        $this->processor($processorClass)->process($this->message($opinionId), []);

        self::assertCount(0, $emails->messages);
    }

    /** @return iterable<string, array{class-string, string}> */
    public static function disabledModerationScenarios(): iterable
    {
        yield 'opinion creation' => [OpinionCreateProcessor::class, 'opinion1'];
        yield 'opinion update' => [OpinionUpdateProcessor::class, 'opinion1'];
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

    private function message(string $opinionId): Message
    {
        return new Message(json_encode(['opinionId' => $opinionId], \JSON_THROW_ON_ERROR));
    }
}
