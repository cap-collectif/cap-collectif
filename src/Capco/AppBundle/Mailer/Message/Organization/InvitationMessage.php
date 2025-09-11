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
            'organizationName' => $invitation->getOrganization()->getTitle(),
            'invitationUrl' => $params['invitationUrl'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'plateformName' => $params['plateformName'],
            'siteUrl' => $params['siteURL'],
        ];
    }

    public static function getMySubjectVars(
        PendingOrganizationInvitation $invitation,
        array $params
    ): array {
        return [
            'organizationName' => $invitation->getOrganization()->getTitle(),
            'plateformName' => $params['organizationName'],
        ];
    }
}
