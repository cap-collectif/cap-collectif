<?php

namespace Capco\AppBundle\Processor\Argument;

use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ArgumentDeleteProcessor implements ProcessorInterface
{
    public function process(Message $message, array $options): bool
    {
        return true;
    }
}
