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
            'userProjectsActivities' => $activity->getUserProjects(),
            'sendAt' => $params['sendAt'],
            'username' => $activity->getUsername(),
            'siteName' => $params['siteName'],
            'timezone' => $params['sendAt']->getTimezone(),
            'to' => self::escape($activity->getEmail()),
            'siteUrl' => $params['siteURL'],
            'urlManagingFollowings' => $activity->getUrlManagingFollowings(),
            'business' => 'Cap Collectif',
            'businessUrl' => 'https://cap-collectif.com/',
        ];
    }

    public static function getMySubjectVars(UserActivity $activity, array $params): array
    {
        return [
            '{siteName}' => $params['siteName'],
        ];
    }
}
