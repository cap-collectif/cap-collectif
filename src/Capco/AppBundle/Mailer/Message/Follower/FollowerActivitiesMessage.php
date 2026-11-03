<?php

namespace Capco\AppBundle\Mailer\Message\Follower;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Model\UserActivity;

final class FollowerActivitiesMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'your-activity-summary-of';
    public const TEMPLATE = '@CapcoMail/notifyFollowerActivities.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(UserActivity $activity, array $params): array
    {
        return [
            'sendAt' => $params['sendAt'],
            'username' => $activity->getUsername(),
            'siteName' => $params['siteName'],
            'timezone' => $params['sendAt']->getTimezone(),
            'baseUrl' => rtrim((string) $params['baseURL'], '/'),
            'urlManagingFollowings' => $activity->getUrlManagingFollowings(),
        ] + FollowerActivitiesDigest::build(
            $activity->getUserProjects(),
            $params['primaryColor'] ?? null,
            $params['primaryTextColor'] ?? null
        );
    }

    public static function getMySubjectVars(UserActivity $activity, array $params): array
    {
        return [
            '{siteName}' => $params['siteName'],
        ];
    }
}
