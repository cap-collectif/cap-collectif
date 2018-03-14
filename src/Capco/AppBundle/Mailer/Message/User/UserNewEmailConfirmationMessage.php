<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\ExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserNewEmailConfirmationMessage extends ExternalMessage
{
    public static function create(
        User $user,
        string $confirmationUrl,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email.confirmNewEmail.subject',
            static::getMySubjectVars(),
            '@CapcoMail/confirmNewEmail.html.twig',
            static::getMyTemplateVars(
                $user,
                $confirmationUrl
            )
        );
    }

    private static function getMyTemplateVars(
        $user,
        $confirmationUrl
    ): array {
        return [
            'user' => $user,
            'confirmationUrl' => $confirmationUrl,
        ];
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
}
