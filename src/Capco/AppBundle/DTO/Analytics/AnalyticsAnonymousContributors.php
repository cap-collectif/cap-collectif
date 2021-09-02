<?php

namespace Capco\AppBundle\DTO\Analytics;

use Elastica\ResultSet;

class AnalyticsAnonymousContributors implements Aggregatable
{
    use AggregatableTrait;

    private function __construct(int $totalCount, iterable $values)
    {
        $this->totalCount = $totalCount;
        $this->values = $values;
    }

    public static function fromEs(ResultSet $set): self
    {
        $documents = array_map(
            static fn(array $document) => AggregatedResult::fromEs(
                $document,
                'anonymous_participants_per_interval'
            ),
            $set->getAggregation('anonymous_participations_per_interval')['buckets']
        );

        return new self($set->getAggregation('anonymous_participants')['value'], $documents);
    }
}
