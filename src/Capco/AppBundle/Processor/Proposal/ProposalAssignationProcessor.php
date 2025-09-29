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
    public function __construct(
        private readonly ProposalRepository $proposalRepository,
        private readonly UserRepository $userRepository,
        private readonly AnalysisNotifier $notifier,
        private readonly LoggerInterface $logger
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $decoded = json_decode((string) $message->getBody(), true);
        $assigned = $this->userRepository->find($decoded['assigned']);
        $role = $decoded['role'];
        $proposals = $this->proposalRepository->findByProposalIds($decoded['proposals']);

        if (!$assigned) {
            $this->logger->error(
                sprintf('%s Unable to find user with id: %s', self::class, $decoded['assigned'])
            );

            return false;
        }

        if (empty($proposals)) {
            $this->logger->error(
                sprintf(
                    '%s Unable to find any proposal with ids: %s',
                    self::class,
                    implode(', ', $decoded['proposals'])
                )
            );

            return false;
        }

        $this->notifier->onAssignation($assigned, $proposals, $role);

        return true;
    }
}
