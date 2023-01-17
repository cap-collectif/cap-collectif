<?php

namespace Capco\AppBundle\Processor\User;

use Capco\AppBundle\Notifier\UserNotifier;
use Capco\UserBundle\Repository\UserRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserStepReminderProcessor implements ProcessorInterface
{
    private UserNotifier $notifier;

    public function __construct(UserNotifier $notifier)
    {
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);

        $this->notifier->remindingEmailConfirmationBeforeStepEnd(
            $json['email'],
            $json['username'],
            $json['confirmationUrl'],
            $json['projectTitle']
        );

        return true;
    }
}
