<?php
namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\DefaultMessage;

final class ContactMessage extends DefaultMessage
{
    public static function create(
        string $recipentEmail,
        string $senderEmail,
        string $senderName,
        string $message,
        string $sitename,
        string $siteUrl,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email-subject-contact',
            static::getMySubjectVars($senderName),
            'email-content-contact',
            static::getMyTemplateVars($message, $senderEmail, $senderName, $sitename, $siteUrl),
            $senderEmail,
            $senderName
        );
    }

    private static function getMyTemplateVars(
        string $message,
        string $email,
        string $name,
        string $sitename,
        string $siteUrl
    ): array {
        return [
            '{message}' => $message,
            '{email}' => $email,
            '{name}' => $name,
            '{sitename}' => $sitename,
            '{siteUrl}' => $siteUrl,
        ];
    }

    private static function getMySubjectVars(string $senderName): array
    {
        return ['{sender}' => $senderName];
    }
}
