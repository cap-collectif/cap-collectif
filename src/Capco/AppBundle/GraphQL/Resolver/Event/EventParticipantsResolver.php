<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class EventParticipantsResolver
{
    private $userRepository;
    private $eventRegistrationRepository;
    private $logger;

    public function __construct(UserRepository $userRepository, EventRegistrationRepository $eventRegistrationRepository, LoggerInterface $logger)
    {
        $this->userRepository = $userRepository;
        $this->eventRegistrationRepository = $eventRegistrationRepository;
        $this->logger = $logger;
    }

    public function __invoke(Event $event, Arg $args): Connection
    {
        $registered = $this->userRepository->getRegisteredParticipantsInEvent($event);
        foreach ($registered as &$user) {
            $user->registeredEvent = $event;
        }
        $notRegistered = $this->eventRegistrationRepository->getNotRegisteredParticipantsInEvent($event);

        $participants = $registered + $notRegistered;
        $totalCount = \count($participants);

        $paginator = new Paginator(function (int $offset, int $limit) use ($participants) {
            try {
                return $participants;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                throw new \RuntimeException($exception->getMessage());
            }
        });

        return $paginator->auto($args, $totalCount);
    }
}
