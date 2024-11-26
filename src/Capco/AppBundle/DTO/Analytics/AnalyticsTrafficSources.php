<?php

namespace Capco\AppBundle\DTO\Analytics;

use Capco\AppBundle\Enum\PlatformAnalyticsTrafficSourceType;
use Elastica\Multi\ResultSet;

class AnalyticsTrafficSources
{
    /**
     * @var AnalyticsTrafficSource[]|iterable
     */
    private readonly iterable $sources;
    private readonly int $totalCount;

    private function __construct(int $totalCount, iterable $sources)
    {
        $this->totalCount = $totalCount;
        $this->sources = $sources;
    }

    public static function fromEs(ResultSet $multiSet): self
    {
        $totalCount = 0;
        $sources = [];

        foreach ($multiSet->getResultSets() as $type => $set) {
            if (PlatformAnalyticsTrafficSourceType::SEARCH_ENGINE === $type) {
                $count = $set->getAggregation('search_engine_entries')['value'];
                $totalCount += $count;
                $sources[] = AnalyticsTrafficSource::create($count, $type);
            } else {
                $count = $set->getTotalHits();
                $sources[] = AnalyticsTrafficSource::create($count, $type);
                $totalCount += $count;
            }
        }

        return new self($totalCount, $sources);
    }

    public function getSources(): iterable
    {
        return $this->sources;
    }

    public function getTotalCount(): int
    {
        return $this->totalCount;
    }
}
