<?php

namespace Capco\AppBundle\DTO\Analytics;

use Elastica\ResultSet;

class AnalyticsVotes implements Aggregatable
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
            static fn (array $document) => AggregatedResult::fromEs($document),
            $set->getAggregation('votes')['buckets']
        );

        return new self($set->getTotalHits(), $documents);
    }
}
