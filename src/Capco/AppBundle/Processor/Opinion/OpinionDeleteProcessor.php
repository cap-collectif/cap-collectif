<?php

namespace Capco\AppBundle\Processor\Opinion;

use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class OpinionDeleteProcessor implements ProcessorInterface
{
    public function process(Message $message, array $options)
    {
        return true;
    }
}
