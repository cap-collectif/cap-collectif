<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\UserBundle\Entity\User;

final class UserAccountConfirmationParticipationMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'please-confirm-your-account';
    public const TEMPLATE = '@CapcoMail/User/userAccountConfirmationParticipationMessage.html.twig';

    public static function getMyTemplateVars(User $user, array $params): array
    {
        return [
            'confirmationURL' => $params['confirmationURL'],
            'organizationName' => $params['organizationName'],
            'platformName' => $params['platformName'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
        ];
    }

    public static function getMySubjectVars(User $user, array $params): array
    {
        return [
            'platformName' => $params['platformName'],
            'username' => $user->getUsername(),
        ];
    }
}
