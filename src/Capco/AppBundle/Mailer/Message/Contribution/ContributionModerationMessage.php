<?php

namespace Capco\AppBundle\Mailer\Message\Contribution;

use Capco\AppBundle\Mailer\Message\DefaultMessage;
use Capco\AppBundle\Model\Contribution;

final class ContributionModerationMessage extends DefaultMessage
{
    public static function create(
        Contribution $contribution,
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
        Contribution $contribution,
        string $trashUrl
    ): array {
        return [
            'contribution' => $contribution,
            'trashUrl' => $trashUrl,
            'username' => $contribution->getAuthor()->getUsername(),
        ];
    }
}
