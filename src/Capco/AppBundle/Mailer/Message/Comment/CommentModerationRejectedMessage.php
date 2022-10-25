<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CommentModerationRejectedMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.comment.moderation.rejected.subject';
    public const TEMPLATE = '@CapcoMail/Comment/commentModerationRejected.html.twig';

    public static function getMyTemplateVars(Comment $comment, array $params): array
    {
        return [
            'objectTitle' => $comment->getRelatedObject()->getTitle(),
            'reason' => $comment->getTrashedReason(),
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
