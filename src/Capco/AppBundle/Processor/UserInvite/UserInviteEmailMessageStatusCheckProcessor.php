<?php

namespace Capco\AppBundle\Processor\UserInvite;

use Capco\AppBundle\Notifier\UserInviteEmailMessageNotifier;
use Capco\AppBundle\Repository\UserInviteEmailMessageRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserInviteEmailMessageStatusCheckProcessor implements ProcessorInterface
{
    public function __construct(private readonly UserInviteEmailMessageRepository $repository, private readonly UserInviteEmailMessageNotifier $notifier)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        list($emailMessageId, $providerClass) = [$json['id'], $json['provider']];

        if (!($emailMessage = $this->repository->find($emailMessageId))) {
            throw new \RuntimeException('Unable to find UserInviteEmailMessage with id : ' . $emailMessageId);
        }
        $hasStatusFailed = $this->notifier->onStatusCheckInvitation($emailMessage, $providerClass);

        if (!$hasStatusFailed) {
            throw new \RuntimeException("The invitation still got status 'sent', retrying...");
        }

        return false;
    }
}
