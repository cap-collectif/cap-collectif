<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\DefaultMessage;
use Capco\UserBundle\Entity\User;

final class UserNewPasswordConfirmationMessage extends DefaultMessage
{
    public static function create(
        User $user,
        \DateTime $currentDate,
        string $siteName,
        string $baseUrl,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email.notification.password.change.subject',
            static::getMySubjectVars(),
            '@CapcoMail/confirmPasswordChange.html.twig',
            static::getMyTemplateVars($user, $currentDate, $siteName, $baseUrl)
        );
    }

    private static function getMyTemplateVars($user, $date, $siteName, $baseUrl): array
    {
        return [
            'user' => $user,
            'date' => $date,
            'siteName' => $siteName,
            'baseUrl' => $baseUrl,
        ];
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
}
