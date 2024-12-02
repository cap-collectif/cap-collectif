<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalUpdateProcessor implements ProcessorInterface
{
    public function __construct(private readonly ProposalRepository $proposalRepository, private readonly ProposalNotifier $notifier, private readonly LoggerInterface $logger)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);

        $proposal = $this->getProposalFromMessage($json);
        if (!$proposal) {
            return false;
        }

        $this->notifier->onUpdate(
            $proposal,
            $this->getUpdateDateFromMessageOrProposal($json, $proposal)
        );

        return true;
    }

    private function getProposalFromMessage(array $json): ?Proposal
    {
        $proposal = $this->proposalRepository->find($json['proposalId']);

        if (null === $proposal) {
            $this->logger->error(
                self::class . ' - Unable to find proposal with id: ' . $json['proposalId']
            );
        }

        return $proposal;
    }

    private function getUpdateDateFromMessageOrProposal(
        array $json,
        Proposal $proposal
    ): \DateTimeInterface {
        return isset($json['date']) ? new \DateTime($json['date']) : $proposal->getUpdatedAt();
    }
}
