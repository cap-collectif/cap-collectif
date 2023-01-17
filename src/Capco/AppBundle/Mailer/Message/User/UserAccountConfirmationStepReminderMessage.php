<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserAccountConfirmationStepReminderMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'email.user_step_reminder.subject';
    public const TEMPLATE = '@CapcoMail/remindUserAccountStepConfirmation.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(User $user, array $params): array
    {
        return ['siteName' => $params['siteName']];
    }

    public static function getMyTemplateVars(User $user, array $params): array
    {
        return [
            'user' => $user,
            'siteName' => $params['siteName'],
            'confirmationUrl' => $params['confirmationURL'],
            'organizationName' => 'Cap Collectif',
            'siteUrl' => $params['siteURL'],
            'baseUrl' => $params['siteURL'],
            'projectTitle' => $params['projectTitle']
        ];
    }

    public static function mockData()
    {
        return [
            'user' => (new User())->setEmail('dev@cap-collectif.com')->setUsername('hackerman'),
            'siteName' => 'Capco',
            'confirmationUrl' => '/confirm',
            'user_locale' => 'fr_FR',
            'baseUrl' => 'capco.dev',
            'organizationName' => 'Capco',
            'siteUrl' => 'capco.dev',
        ];
    }
}
