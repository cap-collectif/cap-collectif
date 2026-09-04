<?php

namespace Capco\Tests\Processor\Argument;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Notifier\ArgumentNotifier;
use Capco\AppBundle\Processor\Argument\ArgumentCreateProcessor;
use Capco\AppBundle\Processor\Argument\ArgumentTrashProcessor;
use Capco\AppBundle\Processor\Argument\ArgumentUpdateProcessor;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Swarrot\Broker\Message;

/**
 * @internal
 * @coversNothing
 */
class ArgumentProcessorTest extends MailerSnapshotCommandTestCase
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
        string $argumentId
    ): void {
        $argument = $this->createStub(Argument::class);
        $repository = $this->createMock(ArgumentRepository::class);
        $repository->expects(self::once())->method('find')->with($argumentId)->willReturn($argument);
        $notifier = $this->createMock(ArgumentNotifier::class);
        $notifier->expects(self::once())->method($method)->with($argument);

        $processor = new $processorClass($repository, $notifier);

        self::assertTrue($processor->process($this->message($argumentId), []));
    }

    /** @return iterable<string, array{class-string, string, string}> */
    public static function delegationScenarios(): iterable
    {
        yield 'creation with moderation enabled' => [ArgumentCreateProcessor::class, 'onCreation', 'argument206'];
        yield 'creation with moderation disabled' => [ArgumentCreateProcessor::class, 'onCreation', 'argument1'];
        yield 'update with moderation enabled' => [ArgumentUpdateProcessor::class, 'onUpdate', 'argument207'];
        yield 'update with moderation disabled' => [ArgumentUpdateProcessor::class, 'onUpdate', 'argument1'];
        yield 'trash without locale' => [ArgumentTrashProcessor::class, 'onTrash', 'argument208'];
        yield 'trash with locale' => [ArgumentTrashProcessor::class, 'onTrash', 'argument268'];
    }

    /**
     * @dataProvider snapshotScenarios
     *
     * @param class-string $processorClass
     */
    public function testProcessorEmailMatchesSnapshot(
        string $processorClass,
        string $argumentId,
        string $recipient,
        string $subject,
        string $snapshot
    ): void {
        $emails = $this->captureEmails();
        $this->processor($processorClass)->process($this->message($argumentId), []);
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
        yield 'new argument moderation' => [
            ArgumentCreateProcessor::class,
            'argument206',
            'dev@cap-collectif.com',
            'notification-subject-new-argument',
            'createArgumentModeration.html',
        ];
        yield 'updated argument moderation' => [
            ArgumentUpdateProcessor::class,
            'argument207',
            'dev@cap-collectif.com',
            'notification-subject-modified-argument',
            'updateArgumentModeration.html',
        ];
        yield 'trashed English argument' => [
            ArgumentTrashProcessor::class,
            'argument268',
            'john.smith@england.uk',
            'notification-subject-argument-trashed',
            'trashedArgumentAuthorEnglish.html',
        ];
    }

    /**
     * @dataProvider disabledModerationScenarios
     *
     * @param class-string $processorClass
     */
    public function testDisabledModerationDoesNotSendEmail(string $processorClass, string $argumentId): void
    {
        $emails = $this->captureEmails();
        $this->processor($processorClass)->process($this->message($argumentId), []);

        self::assertCount(0, $emails->messages);
    }

    /** @return iterable<string, array{class-string, string}> */
    public static function disabledModerationScenarios(): iterable
    {
        yield 'argument creation' => [ArgumentCreateProcessor::class, 'argument1'];
        yield 'argument update' => [ArgumentUpdateProcessor::class, 'argument1'];
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

    private function message(string $argumentId): Message
    {
        return new Message(json_encode(['argumentId' => $argumentId], \JSON_THROW_ON_ERROR));
    }
}
