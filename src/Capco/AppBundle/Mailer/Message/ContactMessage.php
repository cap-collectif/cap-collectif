<?php

namespace Capco\AppBundle\Mailer\Message;

final class ContactMessage extends DefaultMessage
{
    public static function create(
        string $recipentEmail,
        string $senderEmail,
        string $senderName,
        string $message,
        string $recipientName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'email-subject-contact',
            static::getMySubjectVars(
                $senderName
            ),
            'email-content-contact',
            static::getMyTemplateVars(
                $message
            )
        );
        $message->setSenderEmail($senderEmail)
            ->setSenderName($senderName);

        return $message;
    }

    private static function getMyTemplateVars(
        $message
    ): array {
        return [
            '{message}' => $message,
        ];
    }

    private static function getMySubjectVars(
        $senderName
    ): array {
        return [
            '{sender}' => $senderName,
        ];
    }
}
