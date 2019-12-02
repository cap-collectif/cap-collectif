<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\ExternalMessage;
use Symfony\Component\Security\Core\User\UserInterface;

final class UserResettingPasswordMessage extends ExternalMessage
{
    public static function create(UserInterface $user,
                                  string $recipentEmail,
                                  string $confirmationUrl,
                                  string $recipientName = null): self
    {
        return new self(
            $recipentEmail,
            $recipientName,
            'resetting.email.subject',
            static::getMySubjectVars(),
            'email-content-resetting-password',
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

    private static function getMySubjectVars(): array
    {
        return [];
    }
}
