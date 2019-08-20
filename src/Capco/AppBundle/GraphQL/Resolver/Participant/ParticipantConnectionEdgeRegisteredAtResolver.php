<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class ParticipantConnectionEdgeRegisteredAtResolver implements ResolverInterface
{
    private $eventRegistrationRepository;

    public function __construct(EventRegistrationRepository $eventRegistrationRepository)
    {
        $this->eventRegistrationRepository = $eventRegistrationRepository;
    }

    public function __invoke(Edge $edge): \DateTime
    {
        if ($edge->getNode() instanceof EventRegistration) {
            return $edge->getNode()->getCreatedAt();
        }
        if ($edge->getNode() instanceof User) {
            $registration = $this->eventRegistrationRepository->getOneByUserAndEvent(
                $edge->getNode(),
                $edge->getNode()->registeredEvent
            );

            return $registration->getCreatedAt();
        }
    }
}
