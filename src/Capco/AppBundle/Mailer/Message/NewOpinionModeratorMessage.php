<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Entity\Opinion;

final class NewOpinionModeratorMessage extends Message
{
    public static function create(Opinion $opinion, string $moderatorEmail, string $moderatorName, string $opinionLink, string $authorLink): self
    {
        return new self(
            $moderatorEmail,
            $moderatorName,
            'notification-subject-new-proposal',
            static::getMySubjectVars(
                $opinion->getAuthor()->getUsername(),
                $opinion->getProject()->getTitle(),
            ),
            'notification-content-new-proposal',
            static::getMyTemplateVars(
                $opinion->getTitle(),
                $opinion->getBody(),
                $opinion->getCreatedAt()->format('d/m/Y'),
                $opinion->getCreatedAt()->format('H:i:s'),
                $opinion->getAuthor()->getUsername(),
                $authorLink,
                $opinionLink
            )
        );
    }

    private static function getMyTemplateVars(
        string $title,
        string $body,
        string $createdDate,
        string $createdTime,
        string $authorName,
        string $authorLink,
        string $opinionLink
    ): array {
        return [
            '{title}' => self::escape($title),
            '{body}' => self::escape($body),
            '{createdDate}' => $createdDate,
            '{createdTime}' => $createdTime,
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
