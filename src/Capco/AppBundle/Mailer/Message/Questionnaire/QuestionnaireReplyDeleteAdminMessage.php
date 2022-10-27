<?php

namespace Capco\AppBundle\Mailer\Message\Questionnaire;

use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;

final class QuestionnaireReplyDeleteAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'email.notification.questionnaire.reply.subject.delete';
    public const TEMPLATE = '@CapcoMail/notifyQuestionnaireReply.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(array $arrayReply, array $params): array
    {
        return [
            'projectTitle' => self::escape($arrayReply['project_title']),
            'siteName' => self::escape($params['siteName']),
            'date' => $params['date'],
            'time' => $params['time'],
            'authorName' => $arrayReply['author_name'],
            'questionnaireStepTitle' => $arrayReply['questionnaire_step_title'],
            'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_DELETE_STATE,
            'userUrl' => $params['userURL'],
            'configUrl' => $params['configURL'],
            'baseUrl' => $params['baseURL'],
            'isAnonReply' => false,
        ];
    }

    public static function getMySubjectVars(array $arrayReply, array $params): array
    {
        return [
            '{authorName}' => self::escape($arrayReply['author_name']),
            '{questionnaireStepTitle}' => self::escape($arrayReply['questionnaire_step_title']),
        ];
    }
}
