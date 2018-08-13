<?php
namespace Capco\AppBundle\Mailer\Message\User;

use Capco\AppBundle\Mailer\Message\ExternalMessage;
use Capco\UserBundle\Entity\User;

final class UserAccountConfirmationReminderMessage extends ExternalMessage
{
    public static function create(
        User $user,
        string $confirmationUrl,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'confirm-TODO-maxime',
            static::getMySubjectVars(),
            'confirm-conent-TODO-maxime',
            static::getMyTemplateVars($user, $confirmationUrl)
        );
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
    private static function getMyTemplateVars($user, $confirmationUrl): array
    {
        return ['{username}' => $user->getUsername(), '{confirmationUrl}' => $confirmationUrl];
    }
}
