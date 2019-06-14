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
        \DateTimeInterface $replyUpdatedAt,
        string $siteName,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        string $stepUrl,
        string $questionnaireTitle
    ): self {
        return new self(
            $recipientEmail,
            null,
            "reply.notify.user.${state}",
            static::getMySubjectVars($questionnaireTitle),
            '@CapcoMail/acknowledgeReply.html.twig',
            static::getMyTemplateVars(
                $projectTitle,
                $replyUpdatedAt,
                $siteName,
                $reply,
                $state,
                $userUrl,
                $configUrl,
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
        string $userUrl,
        string $configUrl,
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
            'questionnaireEndDate' => $reply
                ->getQuestionnaire()
                ->getStep()
                ->getEndAt(),
            'state' => $state,
            'userUrl' => $userUrl,
            'configUrl' => $configUrl,
            'baseUrl' => $baseUrl,
            'stepUrl' => $stepUrl,
        ];
    }

    private static function getMySubjectVars(string $questionnaireTitle): array
    {
        return [
            '{questionnaireTitle}' => $questionnaireTitle,
        ];
    }
}
