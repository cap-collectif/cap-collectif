<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Notifier\ProposalNewsNotifier;
use Capco\AppBundle\Repository\PostRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalNewsUpdateProcessor implements ProcessorInterface
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
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['proposalNewsId'];
        /** @var Post $post */
        $post = $this->posRepository->find($id);
        if (!$post) {
            throw new \RuntimeException('Unable to find post with id : ' . $id);
        }

        $this->notifier->onUpdate($post);

        $this->logger->info(__METHOD__ . ' : message sends to administrator');

        return true;
    }
}
