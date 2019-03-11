<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalCreateProcessor implements ProcessorInterface
{
    private $proposalRepository;
    private $notifier;
    private $logger;

    public function __construct(
        ProposalRepository $proposalRepository,
        ProposalNotifier $notifier,
        LoggerInterface $logger
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->notifier = $notifier;
        $this->logger = $logger;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $proposal = $this->proposalRepository->find($json['proposalId']);

        if (!$proposal) {
            $this->logger->error(
                __CLASS__ . 'Unable to find proposal with id: ' . $json['proposalId']
            );

            return false;
        }

        $this->notifier->onCreate($proposal);

        return true;
    }
}
