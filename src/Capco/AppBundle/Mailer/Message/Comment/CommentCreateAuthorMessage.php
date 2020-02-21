<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\UserBundle\Entity\User;

final class CommentCreateAuthorMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'notification.email.anonymous_comment.to_user.create.subject';
    public const TEMPLATE = 'notification.email.comment.to_user.create.body';

    public  static function getMyTemplateVars(Comment $comment, array $params): array {
        return [
            '%userUrl%' => $params['userURL'],
            '%username%' => self::escape($comment->getAuthor()->getUsername()),
            '%proposal%' => self::escape($comment->getRelatedObject() ? $comment->getRelatedObject()->getTitle() : 'none'),
            '%date%' => $comment->getCreatedAt()->format('d/m/Y'),
            '%time%' => $comment->getCreatedAt()->format('H:i:s'),
            '%comment%' => self::escape($comment->getBodyTextExcerpt()),
            '%proposalUrl%' => $params['elementURL'],
            '%disableNotificationsUrl%' => $params['disableNotificationURL'],
            '%notificationsUrl%' => $params['notificationURL']
        ];
    }

    public static function getMySubjectVars(Comment $comment, array $params): array
    {
        return [
            '%username%' => self::escape($comment->getAuthor()->getDisplayName())
        ];
    }
}
