<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalCreateProcessor implements ProcessorInterface
{
    private $proposalRepository;
    private $notifier;

    public function __construct(ProposalRepository $proposalRepository, ProposalNotifier $notifier)
    {
        $this->proposalRepository = $proposalRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $proposal = $this->proposalRepository->find($json['proposalId']);

        if (null === $proposal) {
            throw new \RuntimeException('Unable to find proposal with id : ' . $json['proposalId']);
        }

        $this->notifier->onCreate($proposal);

        return true;
    }
}
