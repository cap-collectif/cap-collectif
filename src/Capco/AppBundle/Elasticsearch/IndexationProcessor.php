<?php

namespace Capco\AppBundle\Elasticsearch;

use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class IndexationProcessor implements ProcessorInterface
{
    private $indexer;

    public function __construct($indexer)
    {
        $this->indexer = $indexer;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);
        $this->indexer->index($json['class'], $json['id']);

        return true;
    }
}
