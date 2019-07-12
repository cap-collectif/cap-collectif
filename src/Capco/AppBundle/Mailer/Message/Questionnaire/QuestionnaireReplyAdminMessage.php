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
        \DateTimeInterface $replyUpdatedAt,
        string $siteName,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
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
                $replyUpdatedAt,
                $siteName,
                $reply,
                $state,
                $userUrl,
                $configUrl,
                $baseUrl,
                $replyShowUrl
            )
        );
    }

    public static function createFromDeletedReply(
        string $recipientEmail,
        array $reply,
        string $projectTitle,
        string $questionnaireStepTitle,
        string $authorUsername,
        string $replyDeletedAt,
        string $siteName,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
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
                $replyDeletedAt,
                $siteName,
                $reply,
                $state,
                $userUrl,
                $configUrl,
                $baseUrl,
                $replyShowUrl
            )
        );
    }

    private static function getMyTemplateVars(
        string $title,
        \DateTimeInterface $updatedAt,
        string $siteName,
        Reply $reply,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        string $replyShowUrl
    ): array {
        return [
            'projectTitle' => self::escape($title),
            'replyUpdatedAt' => $updatedAt,
            'siteName' => self::escape($siteName),
            'date' => $reply->getCreatedAt(),
            'time' => $reply->getCreatedAt()->format('H:i:s'),
            'authorName' => $reply->getAuthor()->getUsername(),
            'questionnaireStepTitle' => $reply->getStep()->getTitle(),
            'state' => $state,
            'userUrl' => $userUrl,
            'configUrl' => $configUrl,
            'baseUrl' => $baseUrl,
            'replyShowUrl' => $replyShowUrl
        ];
    }

    private static function getMyTemplateForDeletedReplyVars(
        string $title,
        string $replyDeletedAt,
        string $siteName,
        array $reply,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        string $replyShowUrl
    ): array {
        $date = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $replyDeletedAt);

        return [
            'projectTitle' => self::escape($title),
            'siteName' => self::escape($siteName),
            'date' => $date,
            'time' => $date->format('H:i:s'),
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
