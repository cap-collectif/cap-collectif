<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalRevision;
use Capco\AppBundle\Notifier\ProposalRevisionNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalRevisionRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalRevisionProcessor implements ProcessorInterface
{
    private readonly ProposalRepository $proposalRepository;
    private readonly ProposalRevisionRepository $proposalRevisionRepository;
    private readonly ProposalRevisionNotifier $notifier;
    private readonly LoggerInterface $logger;

    public function __construct(
        ProposalRepository $proposalRepository,
        ProposalRevisionRepository $proposalRevisionRepository,
        ProposalRevisionNotifier $notifier,
        LoggerInterface $logger
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->proposalRevisionRepository = $proposalRevisionRepository;
        $this->notifier = $notifier;
        $this->logger = $logger;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);

        $proposalRevision = $this->getProposalRevisionFromMessage($json);
        if (!$proposalRevision) {
            return false;
        }

        $proposal = $this->getProposalFromMessage($json);
        if (!$proposal) {
            return false;
        }

        $this->notifier->onCreate($proposalRevision, $proposal);

        return true;
    }

    private function getProposalRevisionFromMessage(array $json): ?ProposalRevision
    {
        $proposalRevision = $this->proposalRevisionRepository->find($json['proposalRevisionId']);

        if (empty($proposalRevision)) {
            $this->logger->error(
                __CLASS__ .
                    ' - Unable to find revision with for proposal revision id: ' .
                    $json['proposalRevisionId']
            );
        }

        return $proposalRevision;
    }

    private function getProposalFromMessage(array $json): ?Proposal
    {
        $proposal = $this->proposalRepository->find($json['proposalId']);

        if (empty($proposal)) {
            $this->logger->error(
                __CLASS__ . ' - Unable to find proposal with for id: ' . $json['proposalId']
            );
        }

        return $proposal;
    }
}
