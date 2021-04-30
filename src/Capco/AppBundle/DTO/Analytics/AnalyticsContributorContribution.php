<?php

namespace Capco\AppBundle\DTO\Analytics;

class AnalyticsContributorContribution
{
    private string $type;
    private int $totalCount;

    private function __construct(string $type, int $totalCount)
    {
        $this->type = $type;
        $this->totalCount = $totalCount;
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
