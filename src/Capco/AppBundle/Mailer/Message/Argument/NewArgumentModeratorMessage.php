<?php

namespace Capco\AppBundle\Mailer\Message\Argument;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Mailer\Message\ModeratorMessage;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Translation\TranslatorInterface;

final class NewArgumentModeratorMessage extends ModeratorMessage
{
    public static function create(Argument $argument, string $moderatorEmail, string $moderatorName = null, string $argumentLink, string $authorLink, RouterInterface $router, TranslatorInterface $translator): self
    {
        $message = new self(
            $moderatorEmail,
            $moderatorName,
            'notification-subject-new-argument',
            static::getMySubjectVars(
                $argument->getAuthor()->getUsername(),
                $argument->getRelated()->getTitle()
            ),
            'notification-content-new-argument',
            static::getMyTemplateVars(
                $translator->trans($argument->getTypeAsString(), [], 'CapcoAppBundle'),
                $argument->getBody(),
                $argument->getCreatedAt()->format('d/m/Y'),
                $argument->getCreatedAt()->format('H:i:s'),
                $argument->getAuthor()->getUsername(),
                $authorLink,
                $argumentLink
            )
        );
        $message->generateModerationLinks($argument, $router);

        return $message;
    }

    private static function getMyTemplateVars(
        string $type,
        string $body,
        string $createdDate,
        string $createdTime,
        string $authorName,
        string $authorLink,
        string $argumentLink
    ): array {
        return [
            '{type}' => $type,
            '{body}' => self::escape($body),
            '{createdDate}' => $createdDate,
            '{createdTime}' => $createdTime,
            '{authorName}' => self::escape($authorName),
            '{authorLink}' => $authorLink,
            '{argumentLink}' => $argumentLink,
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
