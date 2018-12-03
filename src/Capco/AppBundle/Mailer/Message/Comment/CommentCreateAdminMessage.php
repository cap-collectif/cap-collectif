<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AdminMessage;

final class CommentCreateAdminMessage extends AdminMessage
{
    public static function create(
        Comment $comment,
        string $recipentEmail,
        string $commentUrl,
        string $commentAdminUrl,
        string $authorUrl,
        string $recipientName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'notification.email.comment.create.subject',
            static::getMySubjectVars($comment->getAuthor()->getDisplayName()),
            'notification.email.comment.create.body',
            static::getMyTemplateVars(
                $authorUrl,
                $comment->getAuthor()->getDisplayName(),
                $comment->getRelatedObject()->getTitle(),
                $comment->getCreatedAt()->format('d/m/Y'),
                $comment->getCreatedAt()->format('H:i:s'),
                $comment->getBodyTextExcerpt(),
                $commentUrl,
                $commentAdminUrl
            )
        );

        return $message;
    }

    private static function getMyTemplateVars(
        string $authorUrl,
        string $authorName,
        string $proposalTitle,
        string $date,
        string $time,
        string $comment,
        string $proposalUrl,
        string $proposalAdminUrl
    ): array {
        return [
            '%userUrl%' => $authorUrl,
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
