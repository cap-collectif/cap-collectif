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
        array $userProjectsActivities,
        \DateTime $sendAt,
        $siteName
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'your-activity-summary-of',
            static::getMySubjectVars($siteName),
            '@CapcoMail/notifyFollowerActivities.html.twig',
            static::getMyTemplateVars(
                $userProjectsActivities,
                $sendAt,
                $recipientName,
                $siteName
            ),
            null,
            $siteName
        );

        $message->setBcc($followersEmailList);
    }

    private static function getMySubjectVars(string $siteName): array
    {
        return [
            'siteName' => $siteName,
        ];
    }

    private static function getMyTemplateVars(
        array $userProjectsActivities,
        \DateTime $sendAt,
        string $username,
        string $siteName
    ): array {
        return [
            'userProjectsActivities' => $userProjectsActivities,
            'sendAt' => $sendAt,
            'username' => $username,
            'siteName' => $siteName,
            'timezone' => $sendAt->getTimezone(),
        ];
    }
}
