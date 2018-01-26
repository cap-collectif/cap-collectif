<?php

namespace Capco\AppBundle\Mailer\Message\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Mailer\Message\ModeratorMessage;

final class NewOpinionModeratorMessage extends ModeratorMessage
{
    public static function create(Opinion $opinion, string $moderatorEmail, string $moderatorName = null, string $opinionLink, string $authorLink): self
    {
        return new self(
            $moderatorEmail,
            $moderatorName,
            'notification-subject-new-proposal',
            static::getMySubjectVars(
                $opinion->getAuthor()->getUsername(),
                $opinion->getProject()->getTitle()
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

    public function getFooterTemplate()
    {
        return null;
    }

    public function getFooterVars()
    {
        return [];
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
        string $projectName
    ): array {
        return [
            '{projectName}' => self::escape($projectName),
            '{authorName}' => self::escape($authorName),
        ];
    }
}
