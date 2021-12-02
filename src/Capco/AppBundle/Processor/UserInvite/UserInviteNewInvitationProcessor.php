<?php

namespace Capco\AppBundle\Processor\UserInvite;

use Capco\AppBundle\Notifier\UserInviteEmailMessageNotifier;
use Capco\AppBundle\Repository\UserInviteEmailMessageRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserInviteNewInvitationProcessor implements ProcessorInterface
{
    private UserInviteEmailMessageNotifier $notifier;
    private UserInviteEmailMessageRepository $emailMessageRepository;

    public function __construct(
        UserInviteEmailMessageRepository $emailMessageRepository,
        UserInviteEmailMessageNotifier $notifier
    ) {
        $this->notifier = $notifier;
        $this->emailMessageRepository = $emailMessageRepository;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['id'];
        $userInviteEmailMessage = $this->emailMessageRepository->find($id);
        if (!$userInviteEmailMessage) {
            throw new \RuntimeException('Unable to find UserInviteEmailMessage with id : ' . $id);
        }

        // $delivered is always true in UserInviteEmailMessageNotifier.
        return $this->notifier->onNewInvitation($userInviteEmailMessage);
    }
}
