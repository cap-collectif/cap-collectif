<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\Message;

final class ContactMessage extends Message
{
    public static function create(
        string $recipentEmail,
        string $senderEmail,
        string $senderName,
        string $message,
        string $sitename,
        string $siteUrl,
        string $recipientName = null,
        string $object,
        string $title
    ): self {
        $senderName = $senderName ? $senderName : 'Anonyme';

        return new self(
            $recipentEmail,
            $recipientName,
            'via-the-contact-form-of',
            static::getMySubjectVars($sitename, $object),
            '@CapcoMail/contact.html.twig',
            static::getMyTemplateVars(
                $message,
                $senderEmail,
                $senderName,
                $sitename,
                $siteUrl,
                $object,
                $title
            ),
            $senderEmail,
            $senderName
        );
    }

    public function getFooterTemplate(): ?string
    {
        return null;
    }

    public function getFooterVars(): ?array
    {
        return null;
    }

    private static function getMyTemplateVars(
        string $message,
        string $email,
        string $name,
        string $sitename,
        string $siteUrl,
        string $object,
        string $title
    ): array {
        return [
            'message' => $message,
            'email' => $email,
            'name' => $name,
            'sitename' => $sitename,
            'siteUrl' => $siteUrl,
            'object' => $object,
            'title' => $title,
        ];
    }

    private static function getMySubjectVars(string $sitename, string $object): array
    {
        return [
            '{object}' => $object,
            '{siteName}' => $sitename,
        ];
    }
}
