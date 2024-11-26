<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\ProposalNewsNotifier;
use Capco\AppBundle\Repository\PostRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalNewsDeleteProcessor implements ProcessorInterface
{
    private readonly LoggerInterface $logger;
    private readonly ProposalNewsNotifier $notifier;
    private readonly PostRepository $posRepository;

    public function __construct(
        LoggerInterface $logger,
        PostRepository $posRepository,
        ProposalNewsNotifier $notifier
    ) {
        $this->logger = $logger;
        $this->notifier = $notifier;
        $this->posRepository = $posRepository;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
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
