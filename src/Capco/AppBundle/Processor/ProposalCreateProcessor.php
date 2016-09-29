<?php

namespace Capco\AppBundle\Processor;

use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;
use Capco\AppBundle\Manager\Notify;
use Capco\AppBundle\Repository\ProposalRepository;

class ProposalCreateProcessor implements ProcessorInterface
{
    private $proposalRepository;
    private $notifer;

    public function __construct(ProposalRepository $proposalRepository, Notify $notifier)
    {
        $this->proposalRepository = $proposalRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);
        $proposal = $this->proposalRepository->find($json['proposalId']);
        $this->notifier->notifyProposal($proposal, 'create');

        return true;
    }
}
