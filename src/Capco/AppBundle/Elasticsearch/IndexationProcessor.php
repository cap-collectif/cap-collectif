<?php

namespace Capco\AppBundle\Elasticsearch;

use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class IndexationProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly Indexer $indexer,
        private readonly LoggerInterface $logger
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $this->logger->info('Asynchronous indexation of: {json}', ['json' => $message->getBody()]);
        $json = json_decode((string) $message->getBody(), true);
        if (!isset($json['class'], $json['id'])) {
            $this->logger->warning('Invalid message: ' . $message->getBody());

            return true;
        }

        $this->indexer->index($json['class'], $json['id']);
        $this->indexer->finishBulk();

        return true;
    }
}
