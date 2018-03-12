<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\ExternalMessage;
use Symfony\Component\Security\Core\User\UserInterface;

final class UserRegistrationConfirmationMessage extends ExternalMessage
{
    public static function create(UserInterface $user,
                                  string $recipentEmail,
                                  string $confirmationUrl,
                                  string $recipientName = null): self
    {
        return new self(
            $recipentEmail,
            $recipientName,
            'email-subject-registration-confirmation',
            static::getMySubjectVars(
                $user->getUsername()
            ),
            'email-content-registration-confirmation',
            static::getMyTemplateVars(
                $user->getUsername(),
                $confirmationUrl
            )
        );
    }

    private static function getMyTemplateVars(
        string $username,
        string $confirmationUrl
    ): array {
        return [
            '{username}' => $username,
            '{confirmationUrl}' => $confirmationUrl,
        ];
    }

    private static function getMySubjectVars(
        string $username
    ): array {
        return [
            '{username}' => $username,
        ];
    }
}
