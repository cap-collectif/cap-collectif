<?php

namespace Capco\AppBundle\Mailer\Message\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Mailer\Message\ModeratorMessage;

final class UpdateOpinionModeratorMessage extends ModeratorMessage
{
    public static function create(
        Opinion $opinion,
        string $moderatorEmail,
        string $moderatorName = null,
        string $opinionLink,
        string $authorLink,
        $router
    ): self {
        $message = new self(
            $moderatorEmail,
            $moderatorName,
            'notification-subject-modified-proposal',
            static::getMySubjectVars($opinion->getAuthor()->getUsername(), $opinion->getTitle()),
            'notification-content-modified-proposal',
            static::getMyTemplateVars(
                $opinion->getTitle(),
                $opinion->getBody(),
                null === $opinion->getUpdatedAt()
                    ? $opinion->getCreatedAt()->format('d/m/Y')
                    : $opinion->getUpdatedAt()->format('d/m/Y'),
                null === $opinion->getUpdatedAt()
                    ? $opinion->getCreatedAt()->format('H:i:s')
                    : $opinion->getUpdatedAt()->format('H:i:s'),
                $opinion->getAuthor()->getUsername(),
                $authorLink,
                $opinionLink
            )
        );
        $message->generateModerationLinks($opinion, $router);

        return $message;
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
            '{body}' => self::escape(self::cleanHtml($body)),
            '{updatedDate}' => $updatedDate,
            '{updatedTime}' => $updatedTime,
            '{authorName}' => self::escape($authorName),
            '{authorLink}' => $authorLink,
            '{opinionLink}' => $opinionLink,
        ];
    }

    private static function getMySubjectVars(string $authorName, string $proposalTitle): array
    {
        return [
            '{proposalTitle}' => self::escape($proposalTitle),
            '{authorName}' => self::escape($authorName),
        ];
    }
}
