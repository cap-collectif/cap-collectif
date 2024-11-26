<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Notifier\ProposalRevisionNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalRevisionRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class ProposalRevisionReviseProcessor implements ProcessorInterface
{
    private readonly ProposalRepository $proposalRepository;
    private readonly ProposalRevisionRepository $proposalRevisionRepository;
    private readonly ProposalRevisionNotifier $notifier;
    private readonly LoggerInterface $logger;
    private readonly KernelInterface $kernel;

    public function __construct(
        ProposalRepository $proposalRepository,
        ProposalRevisionRepository $proposalRevisionRepository,
        ProposalRevisionNotifier $notifier,
        KernelInterface $kernel,
        LoggerInterface $logger
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->proposalRevisionRepository = $proposalRevisionRepository;
        $this->notifier = $notifier;
        $this->kernel = $kernel;
        $this->logger = $logger;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);

        $proposalRevisions = $this->getProposalRevisionsFromMessage($json);
        if (!$proposalRevisions) {
            return false;
        }

        $proposal = $this->getProposalFromMessage($json);
        if (!$proposal) {
            return false;
        }

        $this->notifier->onUpdate($proposalRevisions, $proposal, $json['date']);

        return true;
    }

    private function getProposalRevisionsFromMessage(array $json): ?array
    {
        $revisedAt =
            'test' == $this->kernel->getEnvironment()
                ? (new \DateTime($json['date']))->setTime(00, 00)
                : new \DateTime($json['date']);

        $proposalRevisions = $this->proposalRevisionRepository->findBy([
            'revisedAt' => $revisedAt,
            'proposal' => $json['proposalId'],
        ]);

        if (empty($proposalRevisions)) {
            $this->logger->error(
                __CLASS__ .
                    ' - Unable to find revisions with for proposal id: ' .
                    $json['proposalId']
            );
        }

        return $proposalRevisions;
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
