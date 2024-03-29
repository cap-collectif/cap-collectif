<?php

namespace Capco\AppBundle\Processor\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Notifier\EventNotifier;
use Capco\AppBundle\Repository\EventRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class EventCreateProcessor implements ProcessorInterface
{
    private EventRepository $eventRepository;
    private EventNotifier $notifier;
    private LoggerInterface $logger;

    public function __construct(
        EventRepository $eventRepository,
        EventNotifier $notifier,
        LoggerInterface $logger
    ) {
        $this->eventRepository = $eventRepository;
        $this->notifier = $notifier;
        $this->logger = $logger;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['eventId'];
        /** @var Event $event */
        $event = $this->eventRepository->find($id);
        if (!$event) {
            throw new \RuntimeException('Unable to find event with id : ' . $id);
        }

        $this->notifier->onCreate($event);

        $this->logger->info(__METHOD__ . ' : message sends to administrator');

        return true;
    }
}
