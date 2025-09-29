<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalUpdateStatusProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly ProposalRepository $proposalRepository,
        private readonly ProposalNotifier $notifier,
        private readonly LoggerInterface $logger
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        /** @var Proposal $proposal */
        $proposal = $this->proposalRepository->find($json['proposalId']);

        if (!$proposal) {
            $this->logger->error(
                __METHOD__ . ' - Unable to find proposal with id: ' . $json['proposalId']
            );

            return false;
        }

        $date = new \DateTime();
        if (isset($json['date'])) {
            if ($json['date'] instanceof \DateTime) {
                $date = $json['date'];
            } elseif (\is_string($json['date'])) {
                $date = new \DateTime($json['date']);
            }
        }

        $this->notifier->onUpdateStatus($proposal, $date);

        return true;
    }
}
