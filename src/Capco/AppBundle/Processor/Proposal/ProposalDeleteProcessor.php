<?php

namespace Capco\AppBundle\Processor\Proposal;

use Swarrot\Broker\Message;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Processor\ProcessorInterface;
use Capco\AppBundle\Notifier\ProposalNotifier;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\ProposalRepository;

class ProposalDeleteProcessor implements ProcessorInterface
{
    private $em;
    private $proposalRepository;
    private $notifier;
    private $logger;

    public function __construct(
        EntityManagerInterface $em,
        ProposalRepository $proposalRepository,
        ProposalNotifier $notifier,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->proposalRepository = $proposalRepository;
        $this->notifier = $notifier;
        $this->logger = $logger;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        
        // Disable the built-in softdelete
        $filters = $this->em->getFilters();
        if ($filters->isEnabled('softdeleted')) {
            $filters->disable('softdeleted');
        }
        
        $decodedId = GlobalId::fromGlobalId($json['proposalId'])['id'];
        /** @var Proposal $proposal */
        $proposal = $this->proposalRepository->find($decodedId);

        if (!$filters->isEnabled('softdeleted')) {
            $filters->enable('softdeleted');
        }

        if (!$proposal) {
            $this->logger->error(
                __CLASS__ . ' - Unable to find proposal with id: ' . $decodedId
            );

            return false;
        }

        if (
            $proposal->getProposalForm()->getNotificationsConfiguration() &&
            $proposal
                ->getProposalForm()
                ->getNotificationsConfiguration()
                ->isOnDelete()
        ) {
            $this->notifier->onDelete($proposal);
        }

        return true;
    }
}
