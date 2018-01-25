<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Entity\Opinion;

final class TrashedOpinionAuthorMessage extends Message
{
    public static function create(Opinion $opinion, string $opinionLink): self
    {
        return new self(
            $opinion->getAuthor()->getEmail(),
            $opinion->getAuthor()->getUsername(),
            'notification-subject-proposal-in-the-trash',
            static::getMySubjectVars(
                $opinion->getTitle()
            ),
            'notification-proposal-in-the-trash',
            static::getMyTemplateVars(
                $opinion->getTrashedReason(),
                $opinion->getTitle(),
                $opinion->getBody(),
                $opinion->getTrashedAt()->format('d/m/Y'),
                $opinion->getTrashedAt()->format('H:i:s'),
                $opinionLink
            )
        );
    }

    private static function getMyTemplateVars(
        string $trashedReason,
        string $title,
        string $body,
        string $trashedDate,
        string $trashedTime,
        string $opinionLink
    ): array {
        return [
            '{trashedReason}' => self::escape($trashedReason),
            '{title}' => self::escape($title),
            '{body}' => self::escape($body),
            '{trashedDate}' => $trashedDate,
            '{trashedTime}' => $trashedTime,
            '{opinionLink}' => $opinionLink,
        ];
    }

    private static function getMySubjectVars(
        string $title
    ): array {
        return [
            '{title}' => self::escape($title),
        ];
    }
}
