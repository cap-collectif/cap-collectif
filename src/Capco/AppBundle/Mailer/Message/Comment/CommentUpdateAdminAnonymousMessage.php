<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CommentUpdateAdminAnonymousMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.email.anonymous.comment.update.subject';
    public const TEMPLATE = 'notification.email.anonymous.comment.update.body';

    public static function getMyTemplateVars(Comment $comment, array $params): array
    {
        return [
            '%username%' => self::escape($comment->getAuthorName()),
            '%proposal%' => self::escape($comment->getRelatedObject()->getTitle()),
            '%date%' => $comment->getUpdatedAt()->format('d/m/Y'),
            '%time%' => $comment->getUpdatedAt()->format('H:i:s'),
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
