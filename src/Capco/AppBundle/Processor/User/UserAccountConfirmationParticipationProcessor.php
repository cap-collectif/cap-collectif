<?php

namespace Capco\AppBundle\Processor\User;

use Capco\AppBundle\Notifier\UserNotifier;
use Capco\UserBundle\Repository\UserRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserAccountConfirmationParticipationProcessor implements ProcessorInterface
{
    private readonly UserNotifier $notifier;
    private readonly UserRepository $userRepository;

    public function __construct(UserNotifier $notifier, UserRepository $userRepository)
    {
        $this->notifier = $notifier;
        $this->userRepository = $userRepository;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['userId'];
        $user = $this->userRepository->find($id);
        if (!$user) {
            throw new \RuntimeException('Unable to find user with id : ' . $id);
        }

        $this->notifier->onAccountConfirmationParticipation($user);

        return true;
    }
}
