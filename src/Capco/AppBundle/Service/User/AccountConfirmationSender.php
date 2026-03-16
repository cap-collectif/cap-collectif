<?php

namespace Capco\AppBundle\Service\User;

use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\UserBundle\Entity\User;

class AccountConfirmationSender
{
    public function __construct(private readonly FOSNotifier $notifier)
    {
    }

    public function sendIfNeeded(User $user): void
    {
        if ($user->isEmailConfirmed()) {
            return;
        }

        $emailConfirmationSentAt = $user->getEmailConfirmationSentAt();
        if (
            $emailConfirmationSentAt
            && $emailConfirmationSentAt > (new \DateTime())->modify('-1 minutes')
        ) {
            return;
        }

        $this->notifier->sendConfirmationEmailMessage($user);
        $user->setEmailConfirmationSentAt(new \DateTime());
    }
}
