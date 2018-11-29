<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AdminMessage;

final class CommentCreateAdminAnonymousMessage extends AdminMessage
{
    public static function create(
        Comment $comment,
        string $recipentEmail,
        string $proposalUrl,
        string $commentAdminUrl,
        string $recipientName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'notification.email.anonymous.comment.create.subject',
            static::getMySubjectVars($comment->getAuthorName()),
            'notification.email.anonymous.comment.create.body',
            static::getMyTemplateVars(
                $comment->getAuthorName(),
                $comment->getRelatedObject() ? $comment->getRelatedObject()->getTitle() : 'none',
                $comment->getCreatedAt()->format('d/m/Y'),
                $comment->getCreatedAt()->format('H:i:s'),
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

    private static function getMySubjectVars(string $username): array
    {
        return [
            '%username%' => self::escape($username),
        ];
    }
}
