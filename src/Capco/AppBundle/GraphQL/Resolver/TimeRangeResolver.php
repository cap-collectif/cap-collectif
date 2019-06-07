<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Event;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class TimeRangeResolver implements ResolverInterface
{
    public function __invoke(Event $event)
    {
        return [
            'startAt' => $event->getStartAt(),
            'endAt' => $event->getEndAt(),
        ];
    }
}
