<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Capco\AppBundle\Entity\Event;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class EventViewerCanJoinBeforeStartResolver implements ResolverInterface
{
    public function __invoke(Event $event, $viewer): bool
    {
        if ($viewer) {
            if ($event->getAnimator() && ($event->getAnimator()->getId() === $viewer->getId())) {
                return true;
            }
            if ($event->getAuthor() && ($event->getAuthor()->getId() === $viewer->getId())) {
                return true;
            }
        }

        return false;
    }
}

