<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\ProposalCollectEmailPublishedNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalCollectEmailPublishedProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly ProposalCollectEmailPublishedNotifier $notifier,
        private readonly ProposalRepository $proposalRepository,
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);

        $proposalId = $json['proposalId'] ?? null;

        if (!$proposalId) {
            return false;
        }

        $proposal = $this->proposalRepository->find($proposalId);

        if (!$proposal) {
            throw new \RuntimeException('Unable to find proposal with id : ' . $proposalId);
        }

        $this->notifier->onPublish($proposal);

        return true;
    }
}
