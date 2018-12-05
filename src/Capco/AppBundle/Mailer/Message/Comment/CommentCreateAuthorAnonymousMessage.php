<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\ExternalMessage;

final class CommentCreateAuthorAnonymousMessage extends ExternalMessage
{
    public static function create(
        Comment $comment,
        string $recipentEmail,
        string $commentUrl,
        string $disableNotificationsUrl,
        string $notificationsUrl,
        string $recipientName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'notification.email.anonymous_comment.to_user.create.subject',
            static::getMySubjectVars($comment->getAuthorName()),
            'notification.email.anonymous_comment.to_user.create.body',
            static::getMyTemplateVars(
                $comment->getAuthorName(),
                $comment->getRelatedObject() ? $comment->getRelatedObject()->getTitle() : 'none',
                $comment->getCreatedAt()->format('d/m/Y'),
                $comment->getCreatedAt()->format('H:i:s'),
                $comment->getBodyTextExcerpt(),
                $commentUrl,
                $disableNotificationsUrl,
                $notificationsUrl
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
        string $commentUrl,
        string $disableNotificationsUrl,
        string $notificationsUrl
    ): array {
        return [
            '%username%' => self::escape($authorName),
            '%proposal%' => self::escape($proposalTitle),
            '%date%' => $date,
            '%time%' => $time,
            '%comment%' => self::escape($comment),
            '%proposalUrl%' => $commentUrl,
            '%disableNotificationsUrl%' => $disableNotificationsUrl,
            '%notificationsUrl%' => $notificationsUrl,
        ];
    }

    private static function getMySubjectVars(string $username): array
    {
        return [
            '%username%' => self::escape($username),
        ];
    }
}
