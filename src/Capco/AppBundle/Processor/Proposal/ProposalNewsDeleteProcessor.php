<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\ProposalNewsNotifier;
use Capco\AppBundle\Repository\PostRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalNewsDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly PostRepository $posRepository,
        private readonly ProposalNewsNotifier $notifier
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['proposalNewsId'];
        $this->notifier->onDelete([
            'postId' => $id,
            'proposalName' => $json['proposalName'],
            'projectName' => $json['projectName'],
            'postAuthor' => $json['postAuthor'],
        ]);

        $this->logger->info(__METHOD__ . ' : message sends to administrator');

        return true;
    }
}
