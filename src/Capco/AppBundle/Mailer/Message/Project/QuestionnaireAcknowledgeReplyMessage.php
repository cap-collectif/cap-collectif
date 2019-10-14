<?php

namespace Capco\AppBundle\Mailer\Message\Project;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\Message\DefaultMessage;

final class QuestionnaireAcknowledgeReplyMessage extends DefaultMessage
{
    public static function create(
        string $recipientEmail,
        Reply $reply,
        string $projectTitle,
        string $siteName,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        string $stepUrl,
        string $questionnaireStepTitle,
        array $date
    ): self {
        return new self(
            $recipientEmail,
            null,
            "reply.notify.user.${state}",
            static::getMySubjectVars($questionnaireStepTitle),
            '@CapcoMail/acknowledgeReply.html.twig',
            static::getMyTemplateVars(
                $projectTitle,
                $siteName,
                $reply,
                $state,
                $userUrl,
                $configUrl,
                $baseUrl,
                $stepUrl,
                $date
            )
        );
    }

    private static function getMyTemplateVars(
        string $title,
        string $siteName,
        Reply $reply,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        string $stepUrl,
        array $date
    ): array {
        return [
            'projectTitle' => self::escape($title),
            'siteName' => self::escape($siteName),
            'date' => $date['date'],
            'time' => $date['time'],
            'authorName' => $reply->getAuthor() ? $reply->getAuthor()->getUsername() : '',
            'questionnaireStepTitle' => $reply->getStep() ? $reply->getStep()->getTitle() : '',
            'questionnaireEndDate' => $date['endDate'],
            'state' => $state,
            'userUrl' => $userUrl,
            'configUrl' => $configUrl,
            'baseUrl' => $baseUrl,
            'stepUrl' => $stepUrl,
            'timeless' => $reply->getStep() ? $reply->getStep()->isTimeless() : false
        ];
    }

    private static function getMySubjectVars(string $questionnaireStepTitle): array
    {
        return [
            '{questionnaireStepTitle}' => $questionnaireStepTitle
        ];
    }
}
