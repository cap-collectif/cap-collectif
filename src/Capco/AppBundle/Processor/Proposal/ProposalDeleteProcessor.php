<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Manager\Notify;
use Capco\AppBundle\Repository\ProposalRepository;
use Doctrine\ORM\EntityManager;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalDeleteProcessor implements ProcessorInterface
{
    private $em;
    private $proposalRepository;
    private $notifier;

    public function __construct(EntityManager $em, ProposalRepository $proposalRepository, Notify $notifier)
    {
        $this->em = $em;
        $this->proposalRepository = $proposalRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);
        $this->em->getFilters()->disable('softdeleted');
        $proposal = $this->proposalRepository->find($json['proposalId']);
        $this->em->getFilters()->enable('softdeleted');
        $this->notifier->notifyProposal($proposal, 'delete');

        return true;
    }
}
