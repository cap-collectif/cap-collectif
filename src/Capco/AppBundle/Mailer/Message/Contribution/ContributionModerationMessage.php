<?php

namespace Capco\AppBundle\Mailer\Message\Contribution;

use Capco\AppBundle\Mailer\Message\DefaultMessage;

final class ContributionModerationMessage extends DefaultMessage
{
    public static function create(
        $contribution,
        string $trashUrl,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'moderation.notification.subject',
            static::getMySubjectVars(),
            '@CapcoMail/notifyModeration.html.twig',
            static::getMyTemplateVars(
                $contribution,
                $trashUrl
            )
        );
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        $contribution,
        $trashUrl
    ): array {
        return [
            'contribution' => $contribution,
            'trashUrl' => $trashUrl,
        ];
    }
}
