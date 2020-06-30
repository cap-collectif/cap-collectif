<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class IsViewerParticipatingAtEventResolver implements ResolverInterface
{
    use ResolverTrait;

    private EventRegistrationRepository $eventRegistrationRepository;

    public function __construct(EventRegistrationRepository $eventRegistrationRepository)
    {
        $this->eventRegistrationRepository = $eventRegistrationRepository;
    }

    public function __invoke(Event $event, $viewer): bool
    {
        $this->preventNullableViewer($viewer);
        $registration = null;
        if ($viewer instanceof User) {
            $registration = $this->eventRegistrationRepository->getOneByUserAndEvent(
                $viewer,
                $event
            );

            return null !== $registration;
        }

        return false;
    }
}
