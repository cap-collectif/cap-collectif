<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserRegistrationConfirmationMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'email-subject-registration-confirmation';
    public const TEMPLATE = '@CapcoMail/createAccountMessage.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(User $user, array $params): array
    {
        return [
            'username' => $user->getUsername(),
            'siteName' => $params['siteName'],
            'businessName' => 'Cap Collectif',
            'profileUrl' => $params['profileURL'],
            'confirmationUrl' => $params['confirmationURL'],
            'baseUrl' => $params['baseURL']
        ];
    }

    public static function getMySubjectVars(User $user, array $params): array
    {
        return [
            '{username}' => $user->getUsername()
        ];
    }
}
