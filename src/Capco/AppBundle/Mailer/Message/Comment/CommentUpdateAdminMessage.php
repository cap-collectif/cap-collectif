<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CommentUpdateAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.comment.update.subject';
    public const TEMPLATE = 'notification.comment.update.body';

    public static function getMyTemplateVars(Comment $comment, array $params): array
    {
        return [
            'userUrl' => $params['authorURL'],
            'username' => self::escape($comment->getAuthor()->getDisplayName()),
            'proposal' => self::escape($comment->getRelatedObject()->getTitle()),
            'date' => $comment->getUpdatedAt()->format('d/m/Y'),
            'time' => $comment->getUpdatedAt()->format('H:i:s'),
            'comment' => self::escape($comment->getBodyTextExcerpt()),
            'proposalUrl' => $params['commentURL'],
            'commentUrlBack' => $params['adminURL']
        ];
    }

    public static function getMySubjectVars(Comment $comment, array $params): array
    {
        return [
            'username' => self::escape($comment->getAuthor()->getDisplayName()),
        ];
    }
}
