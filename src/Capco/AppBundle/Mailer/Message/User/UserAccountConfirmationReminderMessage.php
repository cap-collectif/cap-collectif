<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserAccountConfirmationReminderMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'email.alert_expire_user.subject';
    public const TEMPLATE = '@CapcoMail/remindUserAccountConfirmation.html.twig';

    public static function getMySubjectVars(User $user, array $params): array
    {
        return [];
    }

    public static function getMyTemplateVars(User $user, array $params): array
    {
        return [
            'username' => $user->getUsername(),
            'emailAddress' => $user->getEmail(),
            'siteName' => $params['siteName'],
            'confirmationUrl' => $params['confirmationURL'],
            'organizationName' => 'Cap Collectif',
            'siteUrl' => $params['siteURL'],
        ];
    }

    public static function mockData()
    {
        return [
            'username' => 'capcoUser',
            'siteName' => 'Capco',
            'emailAddress' => 'dev@cap-collectif.com',
            'confirmationUrl' => '/confirm',
            'user_locale' => 'fr_FR',
            'baseUrl' => 'capco.dev',
            'organizationName' => 'Capco',
            'siteUrl' => 'capco.dev',
        ];
    }
}
