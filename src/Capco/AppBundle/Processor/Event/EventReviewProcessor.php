<?php

namespace Capco\AppBundle\Processor\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Notifier\EventNotifier;
use Capco\AppBundle\Repository\EventRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class EventReviewProcessor implements ProcessorInterface
{
    public function __construct(private readonly EventRepository $eventRepository, private readonly EventNotifier $notifier, private readonly LoggerInterface $logger)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['eventId'];
        /** @var Event $event */
        $event = $this->eventRepository->find($id);

        if (!$event) {
            throw new \RuntimeException('Unable to find event with id : ' . $id);
        }

        $this->notifier->onReview($event);
        $this->logger->info(__METHOD__ . ' : message sends to administrators and participants');

        return true;
    }
}
