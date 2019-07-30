<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\DefaultMessage;
use Capco\UserBundle\Entity\User;

final class UserNewEmailConfirmationMessage extends DefaultMessage
{
    public static function create(
        User $user,
        string $confirmationUrl,
        string $recipentEmail,
        string $siteName,
        string $baseUrl,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email.confirmNewEmail.subject',
            static::getMySubjectVars(),
            '@CapcoMail/confirmNewEmail.html.twig',
            static::getMyTemplateVars($user, $confirmationUrl, $siteName, $baseUrl, $recipentEmail)
        );
    }

    private static function getMyTemplateVars(
        User $user,
        string $confirmationUrl,
        string $siteName,
        string $baseUrl,
        string $recipientEmail
    ): array {
        return [
            'user' => $user,
            'confirmationUrl' => $confirmationUrl,
            'siteName' => $siteName,
            'baseUrl' => $baseUrl,
            'recipientEmail' => $recipientEmail
        ];
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
}
