<?php

namespace Capco\AppBundle\DTO\Analytics;

use Elastica\ResultSet;

class AnalyticsVisitors implements Aggregatable
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
            static fn (array $document) => AggregatedResult::fromEs(
                $document,
                'unique_visitors_per_interval'
            ),
            $set->getAggregation('visitors_per_interval')['buckets']
        );

        $total = array_reduce(
            $documents,
            fn (?int $totalCountSum, AggregatedResult $item) => $totalCountSum + $item->getTotalCount()
        );

        return new self($total ?? 0, $documents);
    }
}
