<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\ExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserAdminConfirmationMessage extends ExternalMessage
{
    public static function create(
        User $user,
        string $sitename,
        string $confirmationUrl,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email-subject-confirm-admin-account',
            static::getMySubjectVars(
                $sitename
            ),
            'email-content-confirm-admin-account',
            static::getMyTemplateVars(
                $user->getUsername(),
                $sitename,
                $confirmationUrl
            )
        );
    }

    private static function getMyTemplateVars(
        string $username,
        string $sitename,
        string $confirmationUrl
    ): array {
        return [
            '{username}' => $username,
            '{sitename}' => $sitename,
            '{confirmationUrl}' => $confirmationUrl,
        ];
    }

    private static function getMySubjectVars(
        $sitename
    ): array {
        return [
            '{sitename}' => $sitename,
        ];
    }
}
