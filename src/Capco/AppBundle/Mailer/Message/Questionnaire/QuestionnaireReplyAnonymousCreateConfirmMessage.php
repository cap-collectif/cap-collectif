<?php

namespace Capco\AppBundle\Mailer\Message\Questionnaire;

use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class QuestionnaireReplyAnonymousCreateConfirmMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'welcome-to-community';
    public const TEMPLATE = '@CapcoMail/Questionnaire/questionnaireReplyAnonymousCreateConfirm.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(ReplyAnonymous $reply, array $params): array
    {
        return [
            'organizationName' => self::escape($params['organizationName']),
            'baseUrl' => $params['baseURL'],
            'subscribeUrl' => $params['subscribeUrl'],
        ];
    }

    public static function getMySubjectVars(ReplyAnonymous $reply, array $params): array
    {
        return [
            '{siteName}' => self::escape($params['organizationName']),
        ];
    }
}
