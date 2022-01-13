<?php

namespace Capco\AppBundle\Mailer\Message\Questionnaire;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;

final class QuestionnaireReplyCreateAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'email.notification.questionnaire.reply.subject.create';
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
            'authorName' => $reply->getAuthor() ? $reply->getAuthor()->getUsername() : '',
            'questionnaireStepTitle' => $reply->getStep() ? $reply->getStep()->getTitle() : '',
            'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE,
            'userUrl' => $params['userURL'],
            'configUrl' => $params['configURL'],
            'baseUrl' => $params['baseURL'],
            'replyShowUrl' => $params['replyShowURL'],
            'isAnonReply' => false,
        ];
    }

    public static function getMySubjectVars(Reply $reply, array $params): array
    {
        return [
            '{authorName}' => self::escape($reply->getAuthor()->getUsername()),
            '{questionnaireStepTitle}' => self::escape($reply->getStep()->getTitle()),
        ];
    }
}
