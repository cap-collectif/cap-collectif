<?php

namespace Capco\AppBundle\Processor\Event;

use Capco\AppBundle\Notifier\EventNotifier;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class EventDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EventNotifier $notifier,
        private readonly LoggerInterface $logger
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $event = json_decode((string) $message->getBody(), true);
        $messages = $this->notifier->onDelete($event);
        $this->logger->info(__METHOD__ . ' : ' . var_export($messages, true));
        echo 'There are ' .
            \count($messages) .
            ' messages sends to administrators and participants.';

        return true;
    }
}
