<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserConfirmEmailChangedMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'email.notification.email.change.subject';
    public const TEMPLATE = '@CapcoMail/confirmEmailChange.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(User $user, array $params): array
    {
        return [
            'user' => $user,
            'date' => $params['date'],
            'time' => $params['date']->format('H:i:s'),
            'siteName' => $params['siteName'],
            'baseUrl' => $params['baseURL']
        ];
    }

    public static function getMySubjectVars(User $user, array $params): array
    {
        return [];
    }
}
