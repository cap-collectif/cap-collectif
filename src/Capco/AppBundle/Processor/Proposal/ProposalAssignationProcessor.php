<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\AnalysisNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Repository\UserRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalAssignationProcessor implements ProcessorInterface
{
    private ProposalRepository $proposalRepository;
    private UserRepository $userRepository;
    private AnalysisNotifier $notifier;
    private LoggerInterface $logger;

    public function __construct(
        ProposalRepository $proposalRepository,
        UserRepository $userRepository,
        AnalysisNotifier $notifier,
        LoggerInterface $logger
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->userRepository = $userRepository;
        $this->notifier = $notifier;
        $this->logger = $logger;
    }

    public function process(Message $message, array $options): bool
    {
        $decoded = json_decode($message->getBody(), true);
        $assigned = $this->userRepository->find($decoded['assigned']);
        $role = $decoded['role'];
        $proposals = $this->proposalRepository->findByProposalIds($decoded['proposals']);

        if (!$assigned) {
            $this->logger->error(
                sprintf('%s Unable to find user with id: %s', __CLASS__, $decoded['assigned'])
            );

            return false;
        }

        if (empty($proposals)) {
            $this->logger->error(
                sprintf(
                    '%s Unable to find any proposal with ids: %s',
                    __CLASS__,
                    implode(', ', $decoded['proposals'])
                )
            );

            return false;
        }

        $this->notifier->onAssignation($assigned, $proposals, $role);

        return true;
    }
}
