<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Interfaces\TimeRangeable;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class TimeRangeResolver implements ResolverInterface
{
    public function __invoke(TimeRangeable $entity): array
    {
        return [
            'startAt' => $entity->getStartAt(),
            'endAt' => $entity->getEndAt()
        ];
    }
}
