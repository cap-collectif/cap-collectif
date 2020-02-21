<?php

namespace Capco\AppBundle\Mailer\Message\Questionnaire;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;

final class QuestionnaireAcknowledgeReplyUpdateMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'reply.notify.user.update';
    public const TEMPLATE = '@CapcoMail/acknowledgeReply.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(Reply $reply, array $params): array
    {
        return [
            'projectTitle' => self::escape($reply->getStep()->getProject()->getTitle()),
            'siteName' => self::escape($params['siteName']),
            'date' => $params['date'],
            'time' => $params['time'],
            'authorName' => $reply->getAuthor() ? $reply->getAuthor()->getUsername() : '',
            'questionnaireStepTitle' => $reply->getStep() ? $reply->getStep()->getTitle() : '',
            'questionnaireEndDate' => $params['endDate'],
            'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE,
            'userUrl' => $params['userURL'],
            'configUrl' => $params['configURL'],
            'baseUrl' => $params['baseURL'],
            'stepUrl' => $params['stepURL'],
            'timeless' => $reply->getStep() ? $reply->getStep()->isTimeless() : false
        ];
    }

    public static function getMySubjectVars(Reply $reply, array $params): array
    {
        return [
            '{questionnaireStepTitle}' => $reply->getStep()->getTitle()
        ];
    }
}
