<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class ContactMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'via-the-contact-form-of';
    public const TEMPLATE = '@CapcoMail/contact.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(array $message, array $params): array
    {
        return [
            'message' => $message['message'],
            'email' => $params['senderEmail'],
            'name' => $params['senderName'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
            'baseUrl' => $params['siteURL'],
            'object' => $message['object'],
            'title' => $message['title'],
        ];
    }

    public static function getMySubjectVars(array $message, array $params): array
    {
        return [
            '{object}' => $message['object'],
            '{siteName}' => $params['siteName'],
        ];
    }
}
