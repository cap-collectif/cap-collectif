<?php

namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\DefaultMessage;
use Symfony\Component\Security\Core\User\UserInterface;

final class UserRegistrationConfirmationMessage extends DefaultMessage
{
    public static function create(
        UserInterface $user,
        string $recipentEmail,
        string $confirmationUrl,
        string $siteName,
        string $businessName,
        string $profileUrl,
        string $baseUrl,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email-subject-registration-confirmation',
            static::getMySubjectVars($user->getUsername()),
            '@CapcoMail/createAccountMessage.html.twig',
            static::getMyTemplateVars(
                $user->getUsername(),
                $confirmationUrl,
                $siteName,
                $businessName,
                $profileUrl,
                $baseUrl
            )
        );
    }

    private static function getMyTemplateVars(
        string $username,
        string $confirmationUrl,
        string $siteName,
        string $businessName,
        string $profileUrl,
        string $baseUrl
    ): array {
        return [
            'username' => $username,
            'siteName' => $siteName,
            'businessName' => $businessName,
            'profileUrl' => $profileUrl,
            'confirmationUrl' => $confirmationUrl,
            'baseUrl' => $baseUrl
        ];
    }

    private static function getMySubjectVars(string $username): array
    {
        return [
            '{username}' => $username
        ];
    }
}
