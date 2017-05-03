<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Manager\Notify;
use Capco\AppBundle\Repository\ProposalRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalUpdateProcessor implements ProcessorInterface
{
    private $proposalRepository;
    private $notifier;

    public function __construct(ProposalRepository $proposalRepository, Notify $notifier)
    {
        $this->proposalRepository = $proposalRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);
        $proposal = $this->proposalRepository->find($json['proposalId']);
        $this->notifier->notifyProposal($proposal, 'update');

        return true;
    }
}
