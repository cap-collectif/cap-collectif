<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Entity\Opinion;

final class UpdateOpinionModeratorMessage extends Message
{
    public static function create(Opinion $opinion, string $moderatorEmail, string $moderatorName, string $opinionLink, string $authorLink): self
    {
        return new self(
            'CapcoAppBundle:Mail:UpdateOpinionModeratorMessage.html.twig',
            $moderatorEmail,
            $moderatorName,
            'id.UpdateOpinionModeratorMessage',
            static::getTemplateVars(
                $opinion->getStep()->getProject()->getName(),
                $opinion->getAuthor()->getUsername(),
                $authorLink,
                $opinionLink
            )
        );
    }

    private static function getTemplateVars(
        string $projectName,
        string $authorName,
        string $authorLink,
        string $opinionLink
    ): array {
        return [
            'projectName' => self::escape($projectName),
            'authorName' => self::escape($authorName),
            'authorLink' => $authorLink,
            'opinionLink' => $opinionLink,
        ];
    }
}
