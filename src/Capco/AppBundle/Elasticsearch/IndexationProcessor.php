<?php

namespace Capco\AppBundle\Elasticsearch;

use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class IndexationProcessor implements ProcessorInterface
{
    private $indexer;
    private $logger;

    public function __construct(Indexer $indexer, LoggerInterface $logger)
    {
        $this->indexer = $indexer;
        $this->logger = $logger;
    }

    public function process(Message $message, array $options)
    {
        $this->logger->info('Asynchronous indexation of: {json}', ['json' => $message->getBody()]);
        $json = json_decode($message->getBody(), true);
        $this->indexer->index($json['class'], $json['id']);

        return true;
    }
}
