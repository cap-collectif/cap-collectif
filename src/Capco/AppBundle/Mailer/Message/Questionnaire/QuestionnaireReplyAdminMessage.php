<?php

namespace Capco\AppBundle\Mailer\Message\Questionnaire;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\Message\DefaultMessage;

final class QuestionnaireReplyAdminMessage extends DefaultMessage
{
    public static function create(
        string $recipientEmail,
        Reply $reply,
        string $projectTitle,
        string $questionnaireStepTitle,
        string $authorUsername,
        string $siteName,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        array $date,
        string $replyShowUrl = '#'
    ): self {
        return new self(
            $recipientEmail,
            null,
            "email.notification.questionnaire.reply.subject.${state}",
            self::getMySubjectVars($authorUsername, $questionnaireStepTitle),
            '@CapcoMail/notifyQuestionnaireReply.html.twig',
            self::getMyTemplateVars(
                $projectTitle,
                $siteName,
                $reply,
                $state,
                $userUrl,
                $configUrl,
                $baseUrl,
                $replyShowUrl,
                $date
            )
        );
    }

    public static function createFromDeletedReply(
        string $recipientEmail,
        array $reply,
        string $projectTitle,
        string $questionnaireStepTitle,
        string $authorUsername,
        string $siteName,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        array $date,
        string $replyShowUrl = '#'
    ): self {
        return new self(
            $recipientEmail,
            null,
            "email.notification.questionnaire.reply.subject.${state}",
            self::getMySubjectVars($authorUsername, $questionnaireStepTitle),
            '@CapcoMail/notifyQuestionnaireReply.html.twig',
            self::getMyTemplateForDeletedReplyVars(
                $projectTitle,
                $siteName,
                $reply,
                $state,
                $userUrl,
                $configUrl,
                $baseUrl,
                $replyShowUrl,
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
        string $replyShowUrl,
        array $date
    ): array {
        return [
            'projectTitle' => self::escape($title),
            'siteName' => self::escape($siteName),
            'date' => $date['date'],
            'time' => $date['time'],
            'authorName' => $reply->getAuthor() ? $reply->getAuthor()->getUsername() : '',
            'questionnaireStepTitle' => $reply->getStep() ? $reply->getStep()->getTitle() : '',
            'state' => $state,
            'userUrl' => $userUrl,
            'configUrl' => $configUrl,
            'baseUrl' => $baseUrl,
            'replyShowUrl' => $replyShowUrl
        ];
    }

    private static function getMyTemplateForDeletedReplyVars(
        string $title,
        string $siteName,
        array $reply,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        string $replyShowUrl,
        array $date
    ): array {
        return [
            'projectTitle' => self::escape($title),
            'siteName' => self::escape($siteName),
            'date' => $date['date'],
            'time' => $date['time'],
            'authorName' => $reply['author_name'],
            'questionnaireStepTitle' => $reply['questionnaire_step_title'],
            'state' => $state,
            'userUrl' => $userUrl,
            'configUrl' => $configUrl,
            'baseUrl' => $baseUrl,
            'replyShowUrl' => $replyShowUrl
        ];
    }

    private static function getMySubjectVars(
        string $authorName,
        string $questionnaireStepTitle
    ): array {
        return [
            '{authorName}' => self::escape($authorName),
            '{questionnaireStepTitle}' => self::escape($questionnaireStepTitle)
        ];
    }
}
