<?php

namespace Capco\AppBundle\Processor\User;

use Capco\AppBundle\Notifier\UserNotifier;
use Capco\UserBundle\Repository\UserRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserPasswordProcessor implements ProcessorInterface
{
    private $repository;
    private $notifier;

    public function __construct(UserRepository $repository, UserNotifier $notifier)
    {
        $this->repository = $repository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): void
    {
        $json = json_decode($message->getBody(), true);
        $user = $this->repository->find($json['userId']);
        if (!$user) {
            throw new \RuntimeException('Unable to find user with id : ' . $json['userId']);
        }

        $this->notifier->passwordChangeConfirmation($user);
    }
}
