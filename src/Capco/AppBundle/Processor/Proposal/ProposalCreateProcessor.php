<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalCreateProcessor implements ProcessorInterface
{
    public function __construct(private readonly ProposalRepository $proposalRepository, private readonly ProposalNotifier $notifier, private readonly LoggerInterface $logger)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $proposal = $this->proposalRepository->find($json['proposalId']);

        if (!$proposal) {
            $this->logger->error(
                self::class . 'Unable to find proposal with id: ' . $json['proposalId']
            );

            return false;
        }

        $this->notifier->onCreate($proposal);

        return true;
    }
}
