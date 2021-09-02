<?php

namespace Capco\AppBundle\DTO\Analytics;

class AnalyticsTrafficSource
{
    private string $type;
    private int $totalCount;

    private function __construct(int $totalCount, string $type)
    {
        $this->totalCount = $totalCount;
        $this->type = $type;
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
