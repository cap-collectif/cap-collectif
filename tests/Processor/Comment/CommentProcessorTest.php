<?php

namespace Capco\Tests\Processor\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Notifier\CommentNotifier;
use Capco\AppBundle\Processor\Comment\CommentConfirmAnonymousEmailProcessor;
use Capco\AppBundle\Processor\Comment\CommentCreateProcessor;
use Capco\AppBundle\Processor\Comment\CommentDeleteProcessor;
use Capco\AppBundle\Processor\Comment\CommentUpdateProcessor;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\Tests\Command\EmailCaptureListener;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Swarrot\Broker\Message;

/**
 * @internal
 * @coversNothing
 */
class CommentProcessorTest extends MailerSnapshotCommandTestCase
{
    /**
     * @dataProvider delegationScenarios
     *
     * @param class-string $processorClass
     */
    public function testEntityProcessorsDelegateToNotifier(
        string $processorClass,
        string $method,
        string $commentId
    ): void {
        $comment = $this->createStub(Comment::class);
        $repository = $this->createMock(CommentRepository::class);
        $repository->expects(self::once())->method('find')->with($commentId)->willReturn($comment);
        $notifier = $this->createMock(CommentNotifier::class);
        $notifier->expects(self::once())->method($method)->with($comment);

        $processor = new $processorClass($repository, $notifier);

        self::assertTrue($processor->process($this->message(['commentId' => $commentId]), []));
    }

    /** @return iterable<string, array{class-string, string, string}> */
    public static function delegationScenarios(): iterable
    {
        yield 'create named author' => [CommentCreateProcessor::class, 'onCreate', 'proposalComment1'];
        yield 'create anonymous author' => [CommentCreateProcessor::class, 'onCreate', 'proposalComment6'];
        yield 'update named author' => [CommentUpdateProcessor::class, 'onUpdate', 'proposalComment1'];
        yield 'update anonymous author' => [CommentUpdateProcessor::class, 'onUpdate', 'proposalComment6'];
        yield 'anonymous email confirmation' => [CommentConfirmAnonymousEmailProcessor::class, 'onConfirmAnonymousEmail', 'proposalCommentConfirmationToken'];
    }

    /**
     * @dataProvider deleteDelegationScenarios
     *
     * @param array<string, mixed> $payload
     */
    public function testDeleteProcessorDelegatesToNotifier(array $payload): void
    {
        $notifier = $this->createMock(CommentNotifier::class);
        $notifier->expects(self::once())->method('onDelete')->with($payload);

        self::assertTrue(
            (new CommentDeleteProcessor($notifier))->process($this->message($payload), [])
        );
    }

    /** @return iterable<string, array{array<string, mixed>}> */
    public static function deleteDelegationScenarios(): iterable
    {
        yield 'named author with configured notification email' => [[
            'username' => 'Suzanne Favot',
            'notifying' => true,
            'anonymous' => false,
            'notifyTo' => 'admin',
            'userSlug' => 'sfavot',
            'body' => 'Expedita in et voluptatum repudiandae consequatur atque est. Deleniti delectus dicta omnis quis voluptate. Maiores qui nihil sit laboriosam accusantium.',
            'proposal' => 'Ravalement de la façade de la bibliothèque municipale',
            'proposalFormNotificationEmail' => 'sfavot@cap-collectif.com',
            'projectSlug' => 'budget-participatif-rennes',
            'stepSlug' => 'collecte-des-propositions',
            'proposalSlug' => 'ravalement-de-la-facade-de-la-bibliotheque-municipale',
        ]];
        yield 'named author without configured notification email' => [[
            'username' => 'Suzanne Favot',
            'notifying' => true,
            'anonymous' => false,
            'notifyTo' => 'admin',
            'userSlug' => 'sfavot',
            'body' => 'Expedita in et voluptatum repudiandae consequatur atque est. Deleniti delectus dicta omnis quis voluptate. Maiores qui nihil sit laboriosam accusantium.',
            'proposal' => 'Ravalement de la façade de la bibliothèque municipale',
            'proposalFormNotificationEmail' => null,
            'projectSlug' => 'budget-participatif-rennes',
            'stepSlug' => 'collecte-des-propositions',
            'proposalSlug' => 'ravalement-de-la-facade-de-la-bibliotheque-municipale',
        ]];
        yield 'anonymous author' => [[
            'username' => 'Suzanne Favot',
            'notifying' => true,
            'anonymous' => true,
            'notifyTo' => 'admin',
            'userSlug' => null,
            'body' => 'Expedita in et voluptatum repudiandae consequatur atque est. Deleniti delectus dicta omnis quis voluptate. Maiores qui nihil sit laboriosam accusantium.',
            'proposal' => 'Ravalement de la façade de la bibliothèque municipale',
            'proposalFormNotificationEmail' => null,
            'projectSlug' => 'budget-participatif-rennes',
            'stepSlug' => 'collecte-des-propositions',
            'proposalSlug' => 'ravalement-de-la-facade-de-la-bibliotheque-municipale',
        ]];
    }

    /**
     * @dataProvider emailScenarios
     *
     * @param class-string $processorClass
     */
    public function testEntityProcessorSendsExpectedEmail(
        string $processorClass,
        string $commentId,
        string $subject,
        string $body
    ): void {
        $emails = $this->captureEmails();
        $this->processor($processorClass)->process(
            $this->message(['commentId' => $commentId]),
            []
        );

        $message = $this->getMessageWithSubject($emails, $subject);
        if ('' !== $body) {
            self::assertStringContainsString($body, $message->getBody());
        }
    }

    /** @return iterable<string, array{class-string, string, string, string}> */
    public static function emailScenarios(): iterable
    {
        yield 'create named author' => [
            CommentCreateProcessor::class,
            'proposalComment1',
            'notification.comment.create.subject',
            'notification.comment.create.body',
        ];
        yield 'create anonymous author' => [
            CommentCreateProcessor::class,
            'proposalComment6',
            'notification.comment.create.subject',
            'notification.comment.create.anonymous.body',
        ];
        yield 'update named author' => [
            CommentUpdateProcessor::class,
            'proposalComment1',
            'notification.comment.update.subject',
            'notification.comment.update.body',
        ];
        yield 'update anonymous author' => [
            CommentUpdateProcessor::class,
            'proposalComment6',
            'notification.email.anonymous.comment.update.subject',
            'notification.email.anonymous.comment.update.body',
        ];
        yield 'anonymous email confirmation' => [
            CommentConfirmAnonymousEmailProcessor::class,
            'proposalCommentConfirmationToken',
            'notification.comment.confirm_anonymous_email.subject',
            '',
        ];
    }

    /**
     * @dataProvider deleteEmailScenarios
     *
     * @param array<string, mixed> $payload
     */
    public function testDeleteProcessorSendsExpectedEmail(
        array $payload,
        string $subject,
        string $body,
        ?string $recipient
    ): void {
        $emails = $this->captureEmails();
        $this->processor(CommentDeleteProcessor::class)->process($this->message($payload), []);

        $message = null !== $recipient
            ? $emails->getMessageForRecipient($recipient)
            : $this->getMessageWithSubject($emails, $subject);
        self::assertStringContainsString($subject, (string) $message->getSubject());
        self::assertStringContainsString($body, $message->getBody());
    }

    /** @return iterable<string, array{array<string, mixed>, string, string, string|null}> */
    public static function deleteEmailScenarios(): iterable
    {
        $basePayload = [
            'username' => 'Suzanne Favot',
            'notifying' => true,
            'notifyTo' => 'admin',
            'userSlug' => 'sfavot',
            'body' => 'Expedita in et voluptatum repudiandae consequatur atque est. Deleniti delectus dicta omnis quis voluptate. Maiores qui nihil sit laboriosam accusantium.',
            'proposal' => 'Ravalement de la façade de la bibliothèque municipale',
            'projectSlug' => 'budget-participatif-rennes',
            'stepSlug' => 'collecte-des-propositions',
            'proposalSlug' => 'ravalement-de-la-facade-de-la-bibliotheque-municipale',
        ];

        yield 'named author with configured notification email' => [
            $basePayload + [
                'anonymous' => false,
                'proposalFormNotificationEmail' => 'sfavot@cap-collectif.com',
            ],
            'notification.comment.delete.subject',
            'notification.comment.delete.body',
            'sfavot@cap-collectif.com',
        ];
        yield 'named author without configured notification email' => [
            $basePayload + [
                'anonymous' => false,
                'proposalFormNotificationEmail' => null,
            ],
            'notification.comment.delete.subject',
            'notification.comment.delete.body',
            null,
        ];
        yield 'anonymous author' => [
            $basePayload + [
                'anonymous' => true,
                'userSlug' => null,
                'proposalFormNotificationEmail' => null,
            ],
            'notification.email.anonymous.comment.delete.subject',
            'notification.email.anonymous.comment.delete.body',
            null,
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
