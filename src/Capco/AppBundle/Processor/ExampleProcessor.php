<?php

namespace Capco\AppBundle\Processor;

use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ExampleProcessor implements ProcessorInterface
{
    public function process(Message $message, array $options)
    {
        echo $message->getBody();
        // $body = $message->getBody();
        // $body = json_decode($body);
    }
}
