<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class ParticipantConnectionEdgeRegisteredAnonymouslyResolver
{
    private $eventRegistrationRepository;

    public function __construct(EventRegistrationRepository $eventRegistrationRepository)
    {
        $this->eventRegistrationRepository = $eventRegistrationRepository;
    }

    public function __invoke(Edge $edge): bool
    {
        if ($edge->node instanceof EventRegistration) {
            return $edge->node->isPrivate();
        }
        if ($edge->node instanceof User) {
            $registration = $this->eventRegistrationRepository->getOneByUserAndEvent($edge->node, $edge->node->registeredEvent);

            return $registration->isPrivate();
        }

        return false;
    }
}
