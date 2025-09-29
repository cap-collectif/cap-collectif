<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class EventParticipantsResolver implements QueryInterface
{
    public function __construct(
        private readonly EventRegistrationRepository $eventRegistrationRepository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(Event $event, Arg $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($event) {
            try {
                $registrationEvents = $this->eventRegistrationRepository
                    ->getParticipantsInEvent($event, $limit, $offset)
                    ->getIterator()
                    ->getArrayCopy()
                ;

                foreach ($registrationEvents as $key => $registration) {
                    if ($registration && $registration->getUser()) {
                        $user = $registration->getUser();
                        $user->registeredEvent = $event;
                        $registrationEvents[$key] = $user;
                    }
                }

                return $registrationEvents;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException($exception->getMessage());
            }
        });

        return $paginator->auto(
            $args,
            $this->eventRegistrationRepository->countAllParticipantsInEvent($event)
        );
    }
}
