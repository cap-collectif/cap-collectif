<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\ExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserConfirmEmailChangedMessage extends ExternalMessage
{
    public static function create(
        User $user,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email.confirmEmailChanged.subject',
            static::getMySubjectVars(
                $user->getUsername()
            ),
            'email-content-mail-changed',
            static::getMyTemplateVars(
                $user->getNewEmailToConfirm(),
                $user->getUsername()
            )
        );
    }

    private static function getMyTemplateVars(
        $newEmailToConfirm,
        $username
    ): array {
        return [
            '{newEmailToConfirm}' => $newEmailToConfirm,
            '{username}' => $username,
        ];
    }

    private static function getMySubjectVars(
        string $username
    ): array {
        return [
            '%username%' => $username,
        ];
    }
}
