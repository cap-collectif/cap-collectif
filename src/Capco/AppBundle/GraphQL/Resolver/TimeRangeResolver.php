<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Interfaces\TimeRangable;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class TimeRangeResolver implements ResolverInterface
{
    public function __invoke(TimeRangable $entity)
    {
        return [
            'startAt' => $entity->getStartAt(),
            'endAt' => $entity->getEndAt(),
        ];
    }
}
