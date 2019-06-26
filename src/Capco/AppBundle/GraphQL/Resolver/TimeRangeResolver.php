<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Interfaces\TimeRangeable;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class TimeRangeResolver implements ResolverInterface
{
    public function __invoke(TimeRangeable $entity): ?array
    {
        list($startAt, $endAt) = [$entity->getStartAt(), $entity->getEndAt()];
        if (null === $startAt && null === $endAt) {
            return null;
        }

        return [
            'startAt' => $entity->getStartAt(),
            'endAt' => $entity->getEndAt()
        ];
    }
}
