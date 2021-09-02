<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserResettingPasswordMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'resetting.email.subject';
    public const TEMPLATE = 'email-content-resetting-password';

    public static function getMyTemplateVars(User $user, array $params): array
    {
        return [
            '{username}' => $user->getUsername(),
            '{confirmationUrl}' => $params['confirmationURL'],
        ];
    }

    public static function getMySubjectVars(User $user, array $params): array
    {
        return [];
    }
}
