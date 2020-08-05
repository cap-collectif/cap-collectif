<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CommentCreateAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.comment.create.subject';
    public const TEMPLATE = 'notification.comment.create.body';

    public static function getMyTemplateVars(Comment $comment, array $params): array
    {
        return [
            'userUrl' => $params['authorURL'],
            'username' => self::escape($comment->getAuthor()->getDisplayName()),
            'proposal' => self::escape($comment->getRelatedObject()->getTitle()),
            'date' => $comment->getCreatedAt()->format('d/m/Y'),
            'time' => $comment->getCreatedAt()->format('H:i:s'),
            'comment' => self::escape($comment->getBodyTextExcerpt()),
            'proposalUrl' => $params['commentURL'],
            'commentUrlBack' => $params['adminURL'],
        ];
    }

    public static function getMySubjectVars(Comment $comment, array $params): array
    {
        return [
            'username' => self::escape($comment->getAuthor()->getDisplayName()),
        ];
    }
}
