<?php

namespace Capco\AppBundle\Mailer\Message\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Mailer\Message\AdminMessage;

final class NewOpinionModeratorMessage extends AdminMessage
{
    public static function create(Opinion $opinion, string $moderatorEmail, string $moderatorName, string $opinionLink, string $authorLink): self
    {
        $message = new self(
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

        $message->setSenderEmail('assistance@cap-collectif.com');
        $message->setSenderName('Assistance');

        return $message;
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
