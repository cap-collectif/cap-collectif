<?php

namespace Capco\AppBundle\Mailer\Message\Questionnaire;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\Message\DefaultMessage;

final class QuestionnaireReplyAdminMessage extends DefaultMessage
{
    public static function create(
        Reply $reply,
        string $projectTitle,
        string $questionnaireTitle,
        string $authorUsername,
        \DateTimeInterface $replyUpdatedAt,
        string $siteName,
        string $state,
        string $baseUrl,
        string $stepUrl = '#'
    ): self {
        return new self(
            $reply->getAuthor()->getEmail(),
            null,
            "email.notification.questionnaire.reply.subject.${state}",
            self::getMySubjectVars($authorUsername, $questionnaireTitle),
            '@CapcoMail/notifyQuestionnaireReply.html.twig',
            self::getMyTemplateVars(
                $projectTitle,
                $replyUpdatedAt,
                $siteName,
                $reply,
                $state,
                $baseUrl,
                $stepUrl
            )
        );
    }

    public static function createFromDeletedReply(
        array $reply,
        string $projectTitle,
        string $questionnaireTitle,
        string $authorUsername,
        string $replyDeletedAt,
        string $siteName,
        string $state,
        string $baseUrl,
        string $stepUrl = '#'
    ): self {
        return new self(
            $reply['author_email'],
            null,
            "email.notification.questionnaire.reply.subject.${state}",
            self::getMySubjectVars($authorUsername, $questionnaireTitle),
            '@CapcoMail/notifyQuestionnaireReply.html.twig',
            self::getMyTemplateForDeletedReplyVars(
                $projectTitle,
                $replyDeletedAt,
                $siteName,
                $reply,
                $state,
                $baseUrl,
                $stepUrl
            )
        );
    }

    private static function getMyTemplateVars(
        string $title,
        \DateTimeInterface $updatedAt,
        string $siteName,
        Reply $reply,
        string $state,
        string $baseUrl,
        string $stepUrl
    ): array {
        return [
            'projectTitle' => self::escape($title),
            'replyUpdatedAt' => $updatedAt,
            'siteName' => self::escape($siteName),
            'date' => $reply->getCreatedAt(),
            'authorName' => $reply->getAuthor()->getUsername(),
            'questionnaireTitle' => $reply->getQuestionnaire()->getTitle(),
            'baseUrl' => $baseUrl,
            'state' => $state,
            'stepUrl' => $stepUrl,
        ];
    }

    private static function getMyTemplateForDeletedReplyVars(
        string $title,
        string $replyDeletedAt,
        string $siteName,
        array $reply,
        string $state,
        string $baseUrl,
        string $stepUrl
    ): array {
        return [
            'projectTitle' => self::escape($title),
            'siteName' => self::escape($siteName),
            'date' => \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $replyDeletedAt),
            'authorName' => $reply['author_name'],
            'questionnaireTitle' => $reply['questionnaire_title'],
            'state' => $state,
            'baseUrl' => $baseUrl,
            'stepUrl' => $stepUrl,
        ];
    }

    private static function getMySubjectVars(string $authorName, string $questionnaireTitle): array
    {
        return [
            '{authorName}' => self::escape($authorName),
            '{questionnaireTitle}' => self::escape($questionnaireTitle),
        ];
    }
}
