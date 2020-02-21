<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CommentCreateAdminAnonymousMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.email.anonymous_comment.create.subject';
    public const TEMPLATE = 'notification.email.anonymous_comment.create.body';

    public static function getMyTemplateVars(Comment $comment, array $params): array
    {
        return [
            '%username%' => self::escape($comment->getAuthorName()),
            '%proposal%' => self::escape($comment->getRelatedObject() ? $comment->getRelatedObject()->getTitle() : 'none'),
            '%date%' => $comment->getCreatedAt()->format('d/m/Y'),
            '%time%' => $comment->getCreatedAt()->format('H:i:s'),
            '%comment%' => self::escape($comment->getBodyTextExcerpt()),
            '%proposalUrl%' => $params['commentURL'],
            '%commentUrlBack%' => $params['adminURL'],
        ];
    }

    public static function getMySubjectVars(Comment $comment, array $params): array
    {
        return [
            '%username%' => self::escape($comment->getAuthorName()),
        ];
    }
}
