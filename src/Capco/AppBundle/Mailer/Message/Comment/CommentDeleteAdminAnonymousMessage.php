<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Mailer\Message\AdminMessage;

final class CommentDeleteAdminAnonymousMessage extends AdminMessage
{
    public static function create(array $comment,
                                  string $recipentEmail,
                                  string $proposalUrl,
                                  string $recipientName = null): self
    {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'notification.email.anonymous.comment.delete.subject',
            static::getMySubjectVars(
                $comment['username']
            ),
            'notification.email.anonymous.comment.delete.body',
            static::getMyTemplateVars(
                $comment['username'],
                $comment['proposal'],
                $comment['body'],
                $proposalUrl
            )
        );

        return $message;
    }

    private static function getMyTemplateVars(
        string $authorName,
        string $proposalTitle,
        string $comment,
        string $proposalUrl
    ): array {
        return [
            '%username%' => self::escape($authorName),
            '%proposal%' => self::escape($proposalTitle),
            '%comment%' => self::escape($comment),
            '%proposalUrl%' => $proposalUrl,
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
