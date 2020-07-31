<?php

namespace Capco\AppBundle\Processor\UserInvite;

use Capco\AppBundle\Notifier\UserInviteNotifier;
use Capco\AppBundle\Repository\UserInviteRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserInviteNewInvitationProcessor implements ProcessorInterface
{
    private UserInviteRepository $repository;
    private UserInviteNotifier $notifier;

    public function __construct(UserInviteRepository $repository, UserInviteNotifier $notifier)
    {
        $this->repository = $repository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['id'];
        $userInvite = $this->repository->find($id);
        if (!$userInvite) {
            throw new \RuntimeException('Unable to find userInvite with id : ' . $id);
        }

        $this->notifier->onNewInvitation($userInvite);

        return true;
    }
}
