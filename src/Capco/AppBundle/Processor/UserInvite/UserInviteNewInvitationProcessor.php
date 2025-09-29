<?php

namespace Capco\AppBundle\Processor\UserInvite;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Notifier\UserInviteEmailMessageNotifier;
use Capco\AppBundle\Repository\UserInviteEmailMessageRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserInviteNewInvitationProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly UserInviteEmailMessageRepository $emailMessageRepository,
        private readonly UserInviteEmailMessageNotifier $notifier
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['id'];
        $userInviteEmailMessage = $this->emailMessageRepository->find($id);
        if (!$userInviteEmailMessage instanceof UserInviteEmailMessage) {
            throw new \RuntimeException('Unable to find UserInviteEmailMessage with id : ' . $id);
        }

        if (
            CapcoAppBundleMessagesTypes::USER_INVITE_INVITATION ===
            $userInviteEmailMessage->getMessageType()
        ) {
            // $delivered is always true in UserInviteEmailMessageNotifier.
            return $this->notifier->onNewInvitation($userInviteEmailMessage);
        }

        return $this->notifier->onNewInvitationByOrganization($userInviteEmailMessage);
    }
}
