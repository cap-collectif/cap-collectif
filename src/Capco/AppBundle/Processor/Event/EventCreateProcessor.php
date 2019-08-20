<?php

namespace Capco\AppBundle\Processor\Event;

use Capco\AppBundle\Notifier\EventNotifier;
use Capco\AppBundle\Repository\EventRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class EventCreateProcessor implements ProcessorInterface
{
    private $eventRepository;
    private $notifier;

    public function __construct(EventRepository $eventRepository, EventNotifier $notifier)
    {
        $this->eventRepository = $eventRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['eventId'];
        $event = $this->eventRepository->find($id);
        if (!$event) {
            throw new \RuntimeException('Unable to find event with id : ' . $id);
        }

        $this->notifier->onCreate($event);

        return true;
    }
}
