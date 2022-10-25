<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CommentModerationNotifAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.comment.notif.admin.subject';
    public const TEMPLATE = '@CapcoMail/Comment/commentModerationNotifAdmin.html.twig';

    public static function getMyTemplateVars(Comment $comment, array $params): array
    {
        return [
            'commentAdminUrl' => $params['commentAdminUrl'],
            'commentBody' => $comment->getBody(),
            'organizationName' => $params['organizationName'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
        ];
    }

    public static function getMySubjectVars(Comment $comment, array $params): array
    {
        return ['objectTitle' => $comment->getRelatedObject()->getTitle()];
    }
}
