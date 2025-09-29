<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\AnalysisNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Repository\UserRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalRevokeProcessor implements ProcessorInterface
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
        $proposals = $this->proposalRepository->findByProposalIds($decoded['proposals']);

        if (!$assigned) {
            $this->logger->error(
                self::class . 'Unable to find user with id: ' . $decoded['assigned']
            );

            return false;
        }

        if (empty($proposals)) {
            $this->logger->error(
                self::class .
                    'Unable to find any proposal with ids: ' .
                    implode(', ', $decoded['proposals'])
            );

            return false;
        }

        $this->notifier->onRevoke($assigned, $proposals);

        return true;
    }
}
