<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class EventViewerCanJoinBeforeStartResolver implements ResolverInterface
{
    public function __invoke(Event $event, $viewer): bool
    {
        if ($viewer) {
            if ($event->getAuthor() && $event->getAuthor()->getId() === $viewer->getId()) {
                return true;
            }
        }

        return false;
    }
}
