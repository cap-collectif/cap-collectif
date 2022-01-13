<?php

namespace Capco\AppBundle\Mailer\Message\Questionnaire;

use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;

final class QuestionnaireReplyAnonymousDeleteAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'email.notification.anon.questionnaire.reply.subject.delete';
    public const TEMPLATE = '@CapcoMail/notifyQuestionnaireReply.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(array $arrayReply, array $params): array
    {
        return [
            'projectTitle' => self::escape($arrayReply['project_title']),
            'siteName' => self::escape($params['siteName']),
            'date' => $params['date'],
            'time' => $params['time'],
            'questionnaireStepTitle' => $arrayReply['questionnaire_step_title'],
            'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_DELETE_STATE,
            'configUrl' => $params['configURL'],
            'baseUrl' => $params['baseURL'],
            'replyShowUrl' => '#',
            'isAnonReply' => true,
        ];
    }

    public static function getMySubjectVars(array $arrayReply, array $params): array
    {
        return [
            '{questionnaireStepTitle}' => self::escape($arrayReply['questionnaire_step_title']),
        ];
    }
}
