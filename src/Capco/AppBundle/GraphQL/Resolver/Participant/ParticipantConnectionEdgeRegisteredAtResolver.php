<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class ParticipantConnectionEdgeRegisteredAtResolver
{
    private $eventRegistrationRepository;

    public function __construct(EventRegistrationRepository $eventRegistrationRepository)
    {
        $this->eventRegistrationRepository = $eventRegistrationRepository;
    }

    public function __invoke(Edge $edge): \DateTime
    {
        if ($edge->node instanceof EventRegistration) {
            return $edge->node->getCreatedAt();
        }
        if ($edge->node instanceof User) {
            $registration = $this->eventRegistrationRepository->getOneByUserAndEvent($edge->node, $edge->node->registeredEvent);

            return $registration->getCreatedAt();
        }
    }
}
