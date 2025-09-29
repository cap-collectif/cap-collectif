<?php

namespace Capco\AppBundle\GraphQL\Resolver\EventParticipant;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class IsViewerParticipatingAtEventResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly EventRegistrationRepository $eventRegistrationRepository
    ) {
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
