<?php

namespace Capco\AppBundle\Mailer\Message\Follower;

use Capco\AppBundle\Mailer\Message\DefaultMessage;
use Capco\AppBundle\Model\Contribution;

final class FollowerActivitiesMessage extends DefaultMessage
{
    public static function create(
        Contribution $contribution,
        string $recipentEmail,
        string $recipientName = null,
        array $followersEmailList
    ): self {
        $message = new self(
            $recipentEmail,
            null,
            'follower.activities.notification.subject',
            static::getMySubjectVars(),
            '@CapcoMail/notifyFollowerActivities.html.twig',
            static::getMyTemplateVars(
                $contribution
            )
        );

        $message->setBcc($followersEmailList);
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        Contribution $contribution
    ): array {
        return [
            'contribution' => $contribution,
        ];
    }
}
