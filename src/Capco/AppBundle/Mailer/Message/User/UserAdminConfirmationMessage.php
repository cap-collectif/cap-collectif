<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserAdminConfirmationMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'email-subject-confirm-admin-account';
    public const TEMPLATE = 'email-content-confirm-admin-account';

    public static function getMyTemplateVars(User $user, array $params): array
    {
        return [
            '{username}' => $user->getUsername(),
            '{sitename}' => $params['siteName'],
            '{confirmationUrl}' => $params['confirmationURL']
        ];
    }

    public static function getMySubjectVars(User $user, array $params): array
    {
        return [
            '{sitename}' => $params['siteName']
        ];
    }
}
