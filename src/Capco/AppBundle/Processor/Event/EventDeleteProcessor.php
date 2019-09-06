<?php

namespace Capco\AppBundle\Processor\Event;

use Capco\AppBundle\Notifier\EventNotifier;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class EventDeleteProcessor implements ProcessorInterface
{
    private $notifier;

    public function __construct(EventNotifier $notifier)
    {
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $event = json_decode($message->getBody(), true);
        $this->notifier->onDelete($event);

        return true;
    }
}
