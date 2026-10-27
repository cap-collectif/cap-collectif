<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Notifier\CommentNotifier;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks moderation subjects, content and explicit recipients through the notifier API with SQL rollback.
 */
class CommentModerationEmailTest extends MailerSnapshotCommandTestCase
{
    /** @dataProvider moderationEmailScenarios */
    public function testModerationEmailIsSentToTheBusinessRecipient(
        string $method,
        string $commentId,
        string $bodyFragment,
        string $recipient,
        string $subject
    ): void {
        $comment = $this->entityManager->getRepository(ProposalComment::class)->find($commentId);
        self::assertInstanceOf(ProposalComment::class, $comment);
        $emails = $this->captureEmails();

        self::getContainer()->get(CommentNotifier::class)->{$method}($comment);

        self::assertCount(1, $emails->messages);
        $message = $emails->messages[0];
        self::assertSame([$recipient], array_map(static fn ($address): string => $address->getAddress(), $message->getTo()));
        self::assertStringContainsString($subject, (string) $message->getSubject());
        self::assertNotEmpty($message->getFrom());
        self::assertNotEmpty($message->getSubject());
        self::assertStringContainsString($bodyFragment, (string) $message->getHtmlBody());
    }

    /** @return iterable<string, array{string, string, string, string, string}> */
    public static function moderationEmailScenarios(): iterable
    {
        yield 'approved identified comment' => ['onModerationApproved', 'proposalComment1', 'comment-has-been-approved-by-admin', 'sfavot@cap-collectif.com', 'notification.comment.moderation.approved.subject'];

        yield 'rejected anonymous comment' => ['onModerationRejected', 'proposalComment6', 'your-comment-has-been-moderated', 'enjoyphoenix@gmail.com', 'notification.comment.moderation.rejected.subject'];

        yield 'admin moderation notice' => ['onModerationNotifAdmin', 'proposalComment1', '/admin/capco/app/comment/proposalComment1/edit', 'dev@cap-collectif.com', 'notification.comment.notif.admin.subject'];
    }
}
