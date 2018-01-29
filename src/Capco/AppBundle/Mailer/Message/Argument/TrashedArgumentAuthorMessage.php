<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Entity\Argument;

final class TrashedArgumentAuthorMessage extends ExternalMessage
{
    public static function create(Argument $argument, string $argumentLink): self
    {
        return new self(
            $argument->getAuthor()->getEmail(),
            $argument->getAuthor()->getUsername(),
            'notification-subject-argument-trashed',
            static::getMySubjectVars(
                $argument->getRelated()->getTitle()
            ),
            'notification-argument-trashed',
            static::getMyTemplateVars(
                $argument->getTrashedReason(),
                $argument->getBody(),
                $argument->getTrashedAt()->format('d/m/Y'),
                $argument->getTrashedAt()->format('H:i:s'),
                $argumentLink
            )
        );
    }

    private static function getMyTemplateVars(
        string $trashedReason,
        string $body,
        string $trashedDate,
        string $trashedTime,
        string $argumentLink
    ): array {
        return [
            '{trashedReason}' => self::escape($trashedReason),
            '{body}' => self::escape($body),
            '{trashedDate}' => $trashedDate,
            '{trashedTime}' => $trashedTime,
            '{argumentLink}' => $argumentLink,
        ];
    }

    private static function getMySubjectVars(
        string $title
    ): array {
        return [
            '{proposalTitle}' => self::escape($title),
        ];
    }
}
