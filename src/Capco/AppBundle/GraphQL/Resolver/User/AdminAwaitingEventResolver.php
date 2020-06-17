<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Repository\EventRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class AdminAwaitingEventResolver implements ResolverInterface
{
    private EventRepository $eventRepository;

    public function __construct(EventRepository $eventRepository)
    {
        $this->eventRepository = $eventRepository;
    }

    public function __invoke(User $viewer): int
    {
        if(!$viewer->isAdmin()){
            return 0;
        }

        return $this->eventRepository->countByUserAndReviewStatus(null, null, [
            EventReviewStatusType::AWAITING,
        ]);
    }
}
