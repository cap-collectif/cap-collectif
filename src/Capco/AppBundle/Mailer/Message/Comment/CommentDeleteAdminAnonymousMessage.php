<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CommentDeleteAdminAnonymousMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.email.anonymous.comment.delete.subject';
    public const TEMPLATE = 'notification.email.anonymous.comment.delete.body';

    public static function getMyTemplateVars(?Comment $comment, array $params): array
    {
        return [
            '%username%' => self::escape($params['comment']['username']),
            '%proposal%' => self::escape($params['comment']['proposal']),
            '%comment%' => self::escape($params['comment']['body']),
            '%proposalUrl%' => $params['proposalURL'],
        ];
    }

    public static function getMySubjectVars(?Comment $comment, array $params): array
    {
        return [
            '%username%' => self::escape($params['comment']['username']),
        ];
    }
}
