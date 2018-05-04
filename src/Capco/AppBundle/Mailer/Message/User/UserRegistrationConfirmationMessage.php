<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\ExternalMessage;
use Symfony\Component\Security\Core\User\UserInterface;

final class UserRegistrationConfirmationMessage extends ExternalMessage
{
    public static function create(UserInterface $user,
                                  string $recipentEmail,
                                  string $confirmationUrl,
                                  string $sitename,
                                  string $businessName,
                                  string $profileUrl,
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
                $confirmationUrl,
                $sitename,
                $businessName,
                $profileUrl
            )
        );
    }

    private static function getMyTemplateVars(
        string $username,
        string $confirmationUrl,
        string $sitename,
        string $businessName,
        string $profileUrl
    ): array {
        return [
            '{username}' => $username,
            '{sitename}' => $sitename,
            '{businessName}' => $businessName,
            '{profileUrl}' => $profileUrl,
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
