<?php

namespace Capco\AppBundle\Processor\User;

use Capco\AppBundle\Notifier\UserNotifier;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserStepReminderProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly UserNotifier $notifier
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);

        $this->notifier->remindingEmailConfirmationBeforeStepEnd(
            $json['email'],
            $json['username'],
            $json['confirmationUrl'],
            $json['projectTitle']
        );

        return true;
    }
}
