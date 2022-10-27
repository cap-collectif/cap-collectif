<?php

namespace Capco\AppBundle\Mailer\Message\Questionnaire;

use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;

final class QuestionnaireReplyAnonymousCreateAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'email.notification.anon.questionnaire.reply.subject.create';
    public const TEMPLATE = '@CapcoMail/notifyQuestionnaireReply.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(ReplyAnonymous $reply, array $params): array
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
            'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE,
            'configUrl' => $params['configURL'],
            'baseUrl' => $params['baseURL'],
            'isAnonReply' => true,
        ];
    }

    public static function getMySubjectVars(ReplyAnonymous $reply, array $params): array
    {
        return [
            '{questionnaireStepTitle}' => self::escape($reply->getStep()->getTitle()),
        ];
    }
}
