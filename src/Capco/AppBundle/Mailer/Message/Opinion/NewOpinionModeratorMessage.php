<?php

namespace Capco\AppBundle\Mailer\Message\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Mailer\Message\ModeratorMessage;
use Symfony\Component\Routing\RouterInterface;

final class NewOpinionModeratorMessage extends ModeratorMessage
{
    public static function create(Opinion $opinion, string $moderatorEmail, string $moderatorName = null, string $opinionLink, string $authorLink, RouterInterface $router): self
    {
        $message = new self(
            $moderatorEmail,
            $moderatorName,
            'notification-subject-new-proposal',
            static::getMySubjectVars(
                $opinion->getAuthor()->getUsername(),
                $opinion->getTitle()
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

        $message->generateModerationLinks($opinion, $router);

        return $message;
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
            '{body}' => self::escape(self::cleanHtml($body)),
            '{createdDate}' => $createdDate,
            '{createdTime}' => $createdTime,
            '{authorName}' => self::escape($authorName),
            '{authorLink}' => $authorLink,
            '{opinionLink}' => $opinionLink,
        ];
    }

    private static function getMySubjectVars(
        string $authorName,
        string $proposalTitle
    ): array {
        return [
            '{proposalTitle}' => self::escape($proposalTitle),
            '{authorName}' => self::escape($authorName),
        ];
    }
}
