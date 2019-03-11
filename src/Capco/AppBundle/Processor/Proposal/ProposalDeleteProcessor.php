<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

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
        $filters = $this->em->getFilters();

        if ($filters->isEnabled('softdeleted')) {
            $filters->disable('softdeleted');
        }
        $proposal = $this->proposalRepository->find($json['proposalId']);

        if (!$filters->isEnabled('softdeleted')) {
            $filters->enable('softdeleted');
        }

        if (!$proposal) {
            $this->logger->error(
                \get_class($this) . ' - Unable to find proposal with id: ' . $json['proposalId']
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
