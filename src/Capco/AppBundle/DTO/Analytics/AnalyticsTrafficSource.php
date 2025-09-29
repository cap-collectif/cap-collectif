<?php

namespace Capco\AppBundle\DTO\Analytics;

class AnalyticsTrafficSource
{
    private function __construct(
        private readonly int $totalCount,
        private readonly string $type
    ) {
    }

    public static function create(int $totalCount, string $type): self
    {
        return new self($totalCount, $type);
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getTotalCount(): int
    {
        return $this->totalCount;
    }
}
