<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserNewEmailConfirmationMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'email.confirmNewEmail.subject';
    public const TEMPLATE = '@CapcoMail/confirmNewEmail.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(User $user, array $params): array
    {
        return [
            'user' => $user,
            'confirmationUrl' => $params['confirmationURL'],
            'siteName' => $params['siteName'],
            'baseUrl' => $params['baseURL'],
            'recipientEmail' => $user->getNewEmailToConfirm(),
        ];
    }

    public static function getMySubjectVars(User $user, array $params): array
    {
        return [];
    }
}
