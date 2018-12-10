<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AdminMessage;

final class CommentUpdateAdminAnonymousMessage extends AdminMessage
{
    public static function create(Comment $comment,
                                  string $recipentEmail,
                                  string $proposalUrl,
                                  string $commentAdminUrl,
                                  string $recipientName = null): self
    {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'notification.email.anonymous.comment.update.subject',
            static::getMySubjectVars(
                $comment->getAuthorName()
            ),
            'notification.email.anonymous.comment.update.body',
            static::getMyTemplateVars(
                $comment->getAuthorName(),
                $comment->getRelatedObject()->getTitle(),
                $comment->getUpdatedAt()->format('d/m/Y'),
                $comment->getUpdatedAt()->format('H:i:s'),
                $comment->getBodyTextExcerpt(),
                $proposalUrl,
                $commentAdminUrl
            )
        );

        return $message;
    }

    private static function getMyTemplateVars(
        string $authorName,
        string $proposalTitle,
        string $date,
        string $time,
        string $comment,
        string $proposalUrl,
        string $proposalAdminUrl
    ): array {
        return [
            '%username%' => self::escape($authorName),
            '%proposal%' => self::escape($proposalTitle),
            '%date%' => $date,
            '%time%' => $time,
            '%comment%' => self::escape($comment),
            '%proposalUrl%' => $proposalUrl,
            '%commentUrlBack%' => $proposalAdminUrl,
        ];
    }

    private static function getMySubjectVars(
        string $username
    ): array {
        return [
            '%username%' => self::escape($username),
        ];
    }
}
