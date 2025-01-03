<?php

namespace Capco\AppBundle\Processor\Organization;

use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Notifier\Organization\OrganizationMemberNotifier;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class OrganizationMemberProcessor implements ProcessorInterface
{
    public function __construct(private readonly PendingOrganizationInvitationRepository $repository, private readonly OrganizationMemberNotifier $notifier)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $invitation = $this->repository->find($json['id']);

        if (!$invitation instanceof PendingOrganizationInvitation) {
            throw new \RuntimeException('Unable to find invitation with id : ' . $json['invitationID']);
        }

        // $delivered is always true in UserInviteEmailMessageNotifier.
        return $this->notifier->onNewInvitation($invitation);
    }
}
