<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\DefaultMessage;
use Capco\UserBundle\Entity\User;

final class UserConfirmEmailChangedMessage extends DefaultMessage
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
            'email.notification.email.change.subject',
            static::getMySubjectVars(),
            '@CapcoMail/confirmEmailChange.html.twig',
            static::getMyTemplateVars($user, $currentDate, $siteName, $baseUrl)
        );
    }

    private static function getMyTemplateVars(
        User $user,
        \DateTime $date,
        string $siteName,
        string $baseUrl
    ): array {
        return [
            'user' => $user,
            'date' => $date,
            'time' => $date->format('H:i:s'),
            'siteName' => $siteName,
            'baseUrl' => $baseUrl
        ];
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
}
