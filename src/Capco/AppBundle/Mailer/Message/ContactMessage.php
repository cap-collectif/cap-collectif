<?php

namespace Capco\AppBundle\Mailer\Message;

final class ContactMessage extends ExternalMessage
{
    public static function create(
        string $recipentEmail,
        string $username,
        string $message,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email-subject-contact',
            static::getMySubjectVars(
                $message
            ),
            'email-content-contact',
            static::getMyTemplateVars(
                $username
            )
        );
    }

    private static function getMyTemplateVars(
        $username
    ): array {
        return [
            '{username}' => $username,
        ];
    }

    private static function getMySubjectVars(
        $message
    ): array {
        return [
            '{message}' => $message,
        ];
    }
}
