<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Mailer\Message\ModeratorMessage;

final class UpdateOpinionModeratorMessage extends ModeratorMessage
{
    public static function create(Opinion $opinion, string $moderatorEmail, string $moderatorName = null, string $opinionLink, string $authorLink): self
    {
        return new self(
            $moderatorEmail,
            $moderatorName,
            'notification-subject-modified-proposal',
            static::getMySubjectVars(
                $opinion->getAuthor()->getUsername(),
                $opinion->getProject()->getTitle(),
            ),
            'notification-content-modified-proposal',
            static::getMyTemplateVars(
                $opinion->getTitle(),
                $opinion->getBody(),
                $opinion->getUpdatedAt()->format('d/m/Y'),
                $opinion->getUpdatedAt()->format('H:i:s'),
                $opinion->getAuthor()->getUsername(),
                $authorLink,
                $opinionLink
            )
        );
    }

    private static function getMyTemplateVars(
        string $title,
        string $body,
        string $updatedDate,
        string $updatedTime,
        string $authorName,
        string $authorLink,
        string $opinionLink
    ): array {
        return [
            '{title}' => self::escape($title),
            '{body}' => self::escape($body),
            '{updatedDate}' => $updatedDate,
            '{updatedTime}' => $updatedTime,
            '{authorName}' => self::escape($authorName),
            '{authorLink}' => $authorLink,
            '{opinionLink}' => $opinionLink,
        ];
    }

    private static function getMySubjectVars(
        string $authorName,
        string $projectName,
    ): array {
        return [
            '{projectName}' => self::escape($projectName),
            '{authorName}' => self::escape($authorName),
        ];
    }
}
