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
        string $senderEmail = null,
        array $userProjectsActivities = null,
        $sendAt
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'notification-subject-new-proposal',
            static::getMySubjectVars(),
            '@CapcoMail/notifyFollowerActivities.html.twig',
            static::getMyTemplateVars(
                $userProjectsActivities,
                $sendAt,
                $recipentEmail
            ),
            $senderEmail
        );

        $message->setBcc($followersEmailList);
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        array $userProjectsActivities,
        string $sendAt
    ): array {
        return [
            'userProjectsActivities' => $userProjectsActivities,
            'sendAt' => $sendAt,
            '',
        ];
    }
}
