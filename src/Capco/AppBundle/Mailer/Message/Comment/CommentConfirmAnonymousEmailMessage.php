<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CommentConfirmAnonymousEmailMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.comment.confirm_anonymous_email.subject';
    public const TEMPLATE = '@CapcoMail/Comment/confirmAnonymousEmail.html.twig';

    public static function getMyTemplateVars(Comment $comment, array $params): array
    {
        return [
            'proposalName' => self::escape($comment->getRelatedObject()->getTitle()),
            'confirmAddressLink' => $params['confirmAddressLink'],
            'organizationName' => $params['organizationName'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
        ];
    }

    public static function getMySubjectVars(Comment $comment, array $params): array
    {
        return [];
    }
}
