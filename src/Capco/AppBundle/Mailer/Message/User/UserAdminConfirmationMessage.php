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
            'email-subject-admin-confirmation',
            static::getMySubjectVars(
                $sitename
            ),
            '@CapcoMail/confirmAdminAccount.html.twig',
            static::getMyTemplateVars(
                $user,
                $sitename,
                $confirmationUrl
            )
        );
    }

    private static function getMyTemplateVars(
        $user,
        $sitename,
        $confirmationUrl
    ): array {
        return [
            'user' => $user,
            'sitename' => $sitename,
            'confirmationUrl' => $confirmationUrl,
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
