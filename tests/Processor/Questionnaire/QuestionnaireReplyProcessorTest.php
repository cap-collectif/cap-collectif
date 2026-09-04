<?php

namespace Capco\Tests\Processor\Questionnaire;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Processor\Questionnaire\QuestionnaireReplyProcessor;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\Tests\Command\EmailCaptureListener;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Swarrot\Broker\Message;

/**
 * @internal
 * @coversNothing
 */
class QuestionnaireReplyProcessorTest extends MailerSnapshotCommandTestCase
{
    protected const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/__snapshots__';

    /**
     * @dataProvider entityScenarios
     */
    public function testEntityStatesDelegateToNotifier(string $state, string $method, string $replyId): void
    {
        $reply = $this->createStub(Reply::class);
        $repository = $this->createMock(ReplyRepository::class);
        $repository->expects(self::once())->method('find')->with($replyId)->willReturn($reply);
        $notifier = $this->createMock(QuestionnaireReplyNotifier::class);
        $notifier->expects(self::once())->method($method)->with($reply);

        self::assertTrue(
            (new QuestionnaireReplyProcessor($repository, $notifier))->process(
                $this->message(['replyId' => $replyId, 'state' => $state]),
                []
            )
        );
    }

    /** @return iterable<string, array{string, string, string}> */
    public static function entityScenarios(): iterable
    {
        yield 'created reply' => [QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE, 'onCreate', 'reply1'];
        yield 'updated reply' => [QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE, 'onUpdate', 'reply1'];
        yield 'published draft reply' => [QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE, 'onCreate', 'reply9'];
    }

    public function testDeletedReplyDelegatesToNotifier(): void
    {
        $reply = [
            'author_slug' => 'welcomattic',
            'deleted_at' => '2019-04-24 11:40:34',
            'project_title' => 'Projet avec questionnaire',
            'questionnaire_step_title' => 'Questionnaire des JO 2024',
            'questionnaire_id' => 'questionnaire1',
            'author_name' => 'welcomattic',
            'is_anon_reply' => false,
        ];
        $notifier = $this->createMock(QuestionnaireReplyNotifier::class);
        $notifier->expects(self::once())->method('onDelete')->with($reply);

        self::assertTrue(
            (new QuestionnaireReplyProcessor($this->createStub(ReplyRepository::class), $notifier))->process(
                $this->message([
                    'reply' => $reply,
                    'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_DELETE_STATE,
                ]),
                []
            )
        );
    }

    /**
     * @dataProvider snapshotScenarios
     *
     * @param array<string, mixed> $payload
     */
    public function testProcessorEmailMatchesSnapshot(
        array $payload,
        string $subject,
        string $snapshot
    ): void {
        $emails = $this->captureEmails();
        $this->processor(QuestionnaireReplyProcessor::class)->process($this->message($payload), []);
        $message = $this->getMessageWithSubject($emails, $subject);

        self::assertStringContainsString($subject, (string) $message->getSubject());

        if ('1' === getenv('UPDATE_EMAIL_SNAPSHOTS')) {
            file_put_contents(
                static::EMAIL_SNAPSHOT_DIRECTORY . '/' . $snapshot,
                $this->getSnapshotBody($message)
            );
        }

        $this->assertEmailMatchesSnapshot($message, $snapshot);
    }

    /** @return iterable<string, array{array<string, mixed>, string, string}> */
    public static function snapshotScenarios(): iterable
    {
        yield 'questionnaire reply creation for admin' => [
            ['replyId' => 'reply1', 'state' => 'create'],
            'email.notification.questionnaire.reply.subject.create',
            'notifyQuestionnaireReply_create.html',
        ];
        yield 'questionnaire reply creation acknowledgement' => [
            ['replyId' => 'reply1', 'state' => 'create'],
            'reply.notify.user.create',
            'notifyUserQuestionnaireReply_create.html',
        ];
        yield 'questionnaire reply update for admin' => [
            ['replyId' => 'reply1', 'state' => 'update'],
            'email.notification.questionnaire.reply.subject.update',
            'notifyQuestionnaireReply_update.html',
        ];
        yield 'questionnaire reply update acknowledgement' => [
            ['replyId' => 'reply1', 'state' => 'update'],
            'reply.notify.user.update',
            'notifyUserQuestionnaireReply_update.html',
        ];
        yield 'questionnaire reply deletion' => [
            [
                'reply' => [
                    'author_slug' => 'welcomattic',
                    'deleted_at' => '2019-04-24 11:40:34',
                    'project_title' => 'Projet avec questionnaire',
                    'questionnaire_step_title' => 'Questionnaire des JO 2024',
                    'questionnaire_id' => 'questionnaire1',
                    'author_name' => 'welcomattic',
                    'is_anon_reply' => false,
                ],
                'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_DELETE_STATE,
            ],
            'email.notification.questionnaire.reply.subject.delete',
            'notifyQuestionnaireReply_delete.html',
        ];
        yield 'published questionnaire draft acknowledgement' => [
            ['replyId' => 'reply9', 'state' => 'create'],
            'reply.notify.user.create',
            'notifyQuestionnaireReply_publishedDraft.html',
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

    private function getMessageWithSubject(EmailCaptureListener $emails, string $subject): \Swift_Mime_SimpleMessage
    {
        foreach ($emails->messages as $message) {
            if (str_contains((string) $message->getSubject(), $subject)) {
                return $message;
            }
        }

        throw new \RuntimeException(sprintf('No email was captured with subject %s.', $subject));
    }

    /** @param array<string, mixed> $payload */
    private function message(array $payload): Message
    {
        return new Message(json_encode($payload, \JSON_THROW_ON_ERROR));
    }
}
