<?php

namespace Capco\AppBundle\Mailer\Message\UserInvite;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class UserInviteNewInvitation extends AbstractExternalMessage
{

    public const SUBJECT = 'email-user-invitation-subject';
    public const TEMPLATE = '@CapcoMail/UserInvite/newInvitation.html.twig';

    public static function getMySubjectVars(UserInvite $invite, array $params): array
    {
        return [];
    }

    public static function getMyTemplateVars(UserInvite $invite, array $params): array
    {
        return [
            'organizationName' => $params['organizationName'],
            'invitationUrl' => $params['invitationUrl'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL']
        ];
    }
}
