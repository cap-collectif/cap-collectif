<?php

namespace Capco\AppBundle\Mailer\Message\Questionnaire;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;

final class QuestionnaireReplyAnonymousUpdateAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'email.notification.anon.questionnaire.reply.subject.update';
    public const TEMPLATE = '@CapcoMail/notifyQuestionnaireReply.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(Reply $reply, array $params): array
    {
        return [
            'projectTitle' => self::escape(
                $reply
                    ->getStep()
                    ->getProject()
                    ->getTitle()
            ),
            'siteName' => self::escape($params['siteName']),
            'date' => $params['date'],
            'time' => $params['time'],
            'questionnaireStepTitle' => $reply->getStep() ? $reply->getStep()->getTitle() : '',
            'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE,
            'userUrl' => $params['userURL'],
            'configUrl' => $params['configURL'],
            'baseUrl' => $params['baseURL'],
            'isAnonReply' => true,
        ];
    }

    public static function getMySubjectVars(Reply $reply, array $params): array
    {
        return [
            '{questionnaireStepTitle}' => self::escape($reply->getStep()->getTitle()),
        ];
    }
}
