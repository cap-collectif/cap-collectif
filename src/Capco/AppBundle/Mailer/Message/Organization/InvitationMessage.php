<?php

namespace Capco\AppBundle\Mailer\Message\Organization;

use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class InvitationMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'notification-subject-organization-invite';
    public const TEMPLATE = '@CapcoMail/Organization/notifyInvitation.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(
        PendingOrganizationInvitation $invitation,
        array $params
    ): array {
        return [
            'organizationName' => $params['organizationName'],
            'invitationUrl' => $params['invitationUrl'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'adminName' => $params['adminName'],
            'plateformName' => $params['plateformName'],
            'siteUrl' => $params['siteURL'],
        ];
    }

    public static function getMySubjectVars(
        PendingOrganizationInvitation $invitation,
        array $params
    ): array {
        return [
            'organizationName' => self::escape($params['organizationName']),
            'plateformName' => $params['plateformName'],
        ];
    }

    public static function mockData()
    {
        return [
            'organizationName' => 'Association des pas contents',
            'plateformName' => 'capco',
            'siteName' => 'capco',
            'invitationUrl' => 'https://capco.dev/invitation/organization/token2',
            'baseUrl' => 'https://capco.dev',
            'adminName' => 'Sylvain de la conception',
            'user_locale' => 'fr_FR',
        ];
    }
}
