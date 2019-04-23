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
        \DateTime $replyUpdatedAt,
        string $siteName,
        string $state,
        string $stepUrl = '#'
    ): self {
        return new self(
            $reply->getAuthor()->getEmail(),
            null,
            "${authorUsername} a ${state} sa réponse au questionnaire \"${questionnaireTitle}\"",
            self::getMySubjectVars($questionnaireTitle, $authorUsername),
            '@CapcoMail/notifyQuestionnaireReply.html.twig',
            self::getMyTemplateVars(
                $projectTitle,
                $replyUpdatedAt,
                $siteName,
                $reply,
                $state,
                $stepUrl
            )
        );
    }

    private static function getMyTemplateVars(
        string $title,
        \DateTime $updatedAt,
        string $siteName,
        Reply $reply,
        string $state,
        string $stepUrl
    ): array {
        return [
            'projectTitle' => self::escape($title),
            'replyUpdatedAt' => $updatedAt,
            'siteName' => self::escape($siteName),
            'date' => $reply->getCreatedAt(),
            'authorName' => $reply->getAuthor()->getUsername(),
            'questionnaireTitle' => $reply->getQuestionnaire()->getTitle(),
            'state' => $state,
            'stepUrl' => $stepUrl,
        ];
    }

    private static function getMySubjectVars(string $authorName, string $questionnaireTitle): array
    {
        return [
            'authorName' => self::escape($authorName),
            'questionnaireTitle' => self::escape($questionnaireTitle),
        ];
    }
}
