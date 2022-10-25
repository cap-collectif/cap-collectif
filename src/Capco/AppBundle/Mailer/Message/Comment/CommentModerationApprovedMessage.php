<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CommentModerationApprovedMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.comment.moderation.approved.subject';
    public const TEMPLATE = '@CapcoMail/Comment/commentModerationApproved.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(Comment $comment, array $params): array
    {
        return [
            'commentUrl' => $params['commentUrl'],
            'organizationName' => $params['organizationName'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
        ];
    }

    public static function getMySubjectVars(Comment $comment, array $params): array
    {
        return ['platformName' => $params['siteName']];
    }
}
