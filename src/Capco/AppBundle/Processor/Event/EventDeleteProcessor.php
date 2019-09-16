<?php

namespace Capco\AppBundle\Processor\Event;

use Capco\AppBundle\Notifier\EventNotifier;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class EventDeleteProcessor implements ProcessorInterface
{
    private $notifier;
    private $logger;

    public function __construct(EventNotifier $notifier, LoggerInterface $logger)
    {
        $this->notifier = $notifier;
        $this->logger = $logger;
    }

    public function process(Message $message, array $options): bool
    {
        $event = json_decode($message->getBody(), true);
        $messages = $this->notifier->onDelete($event);
        $this->logger->info(__METHOD__ . ' : ' . var_export($messages, true));
        echo 'There are ' . \count($messages) . ' messages sends to administrators.';

        return true;
    }
}
