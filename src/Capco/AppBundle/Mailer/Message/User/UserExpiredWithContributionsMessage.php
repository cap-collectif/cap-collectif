<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\ExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserExpiredWithContributionsMessage extends ExternalMessage
{
    public static function create(
        User $user,
        string $confirmUrl,
        string $adminMail,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email.expire_user.subject_with_contrib',
            static::getMySubjectVars(),
            '@CapcoMail/notifyExpiredWithContributions.html.twig',
            static::getMyTemplateVars(
                $user,
                $confirmUrl,
                $adminMail
            )
        );
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        $user,
        $url,
        $email
    ): array {
        return [
            'user' => $user,
            'url' => $url,
            'email' => $email,
        ];
    }
}
