<?php

namespace Capco\AppBundle\Mailer\Message\UserInvite;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class UserInviteNewInvitationByOrganization extends AbstractExternalMessage
{
    public const SUBJECT = 'notification-subject-organization-invite';
    public const TEMPLATE = '@CapcoMail/UserInvite/newInvitationByOrganization.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(UserInvite $invite, array $params): array
    {
        return [
            'organizationName' => self::escape($params['organizationName']),
            'plateformName' => $params['platformName'],
        ];
    }

    public static function getMyTemplateVars(UserInvite $invite, array $params): array
    {
        return [
            'organizationName' => $params['organizationName'],
            'invitationUrl' => $params['invitationUrl'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'platformName' => $params['platformName'],
            'adminName' => $params['adminName'],
            'siteUrl' => $params['siteURL'],
        ];
    }

    public static function mockData(): array
    {
        return [
            'siteName' => 'Capco',
            'baseUrl' => 'capco.dev',
            'organizationName' => 'Capco',
            'siteUrl' => 'capco.dev',
            'invitationUrl' => '/invitation',
            'invitationMessage' => 'A custom message',
            'user_locale' => 'fr-FR',
        ];
    }
}
