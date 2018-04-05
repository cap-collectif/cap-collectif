<?php

namespace Capco\AppBundle\GraphQL\Resolver;

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
        $registred = $this->userRepository->getRegistredParticipantsInEvent($event);
        foreach ($registred as &$user) {
            $user->registredEvent = $event;
        }
        $notRegistred = $this->eventRegistrationRepository->getNotRegistredParticipantsInEvent($event);

        $participants = $registred + $notRegistred;
        $totalCount = count($participants);

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
