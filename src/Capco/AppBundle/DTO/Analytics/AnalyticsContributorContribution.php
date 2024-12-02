<?php

namespace Capco\AppBundle\DTO\Analytics;

class AnalyticsContributorContribution
{
    private function __construct(private readonly string $type, private readonly int $totalCount)
    {
    }

    public static function fromEs(array $document): self
    {
        return new self($document['key'], $document['doc_count']);
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
