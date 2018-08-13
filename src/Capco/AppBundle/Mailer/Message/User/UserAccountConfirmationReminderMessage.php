<?php
namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\ExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserAccountConfirmationReminderMessage extends ExternalMessage
{
    public static function create(User $user, string $confirmationUrl, string $siteName): self
    {
        return new self(
            $user->getEmail(),
            $user->getUsername(),
            'email.alert_expire_user.subject',
            static::getMySubjectVars(),
            '@CapcoMail/remindUserAccountConfirmation.html.twig',
            static::getMyTemplateVars($user, $confirmationUrl, $siteName)
        );
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
    private static function getMyTemplateVars($user, $confirmationUrl, $siteName): array
    {
        return [
            'username' => $user->getUsername(),
            'emailAddress' => $user->getEmail(),
            'siteName' => $siteName,
            'confirmationUrl' => $confirmationUrl,
        ];
    }
}
