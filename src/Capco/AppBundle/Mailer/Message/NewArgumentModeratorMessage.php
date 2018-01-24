<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Entity\Argument;

final class NewArgumentModeratorMessage extends Message
{
    public static function create(Argument $argument, string $moderatorEmail, string $moderatorName, string $argumentLink, string $authorLink): self
    {
        return new self(
            $moderatorEmail,
            $moderatorName,
            'notification-subject-new-argument',
            static::getMySubjectVars(
                $argument->getAuthor()->getUsername(),
                $argument->getProject()->getTitle(),
            ),
            'notification-content-new-argument',
            static::getMyTemplateVars(
                $argument->getTitle(),
                $argument->getBody(),
                $argument->getCreatedAt()->format('d/m/Y'),
                $argument->getCreatedAt()->format('H:i:s'),
                $argument->getAuthor()->getUsername(),
                $authorLink,
                $argumentLink
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
        string $argumentLink
    ): array {
        return [
            '%title%' => self::escape($title),
            '%body%' => self::escape($body),
            '%createdDate%' => $createdDate,
            '%createdTime%' => $createdTime,
            '%authorName%' => self::escape($authorName),
            '%authorLink%' => $authorLink,
            '%argumentLink%' => $argumentLink,
        ];
    }

    private static function getMySubjectVars(
        string $authorName,
        string $projectName,
    ): array {
        return [
            'projectName' => self::escape($projectName),
            'authorName' => self::escape($authorName),
        ];
    }
}
