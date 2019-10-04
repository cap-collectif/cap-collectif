<?php

namespace Capco\AppBundle\Elasticsearch;

class ElasticsearchPaginatedResult
{
    private $entities;

    private $totalCount;

    private $cursors;

    public function __construct(array $entities, array $cursors, ?int $totalCount = 0)
    {
        $this->entities = $entities;
        $this->cursors = $cursors;
        $this->totalCount = $totalCount;
    }

    public function getEntities(): array
    {
        return $this->entities;
    }

    public function setEntities($entities): self
    {
        $this->entities = $entities;

        return $this;
    }

    public function getTotalCount(): int
    {
        return $this->totalCount;
    }

    public function setTotalCount(?int $totalCount = 0): self
    {
        $this->totalCount = $totalCount;

        return $this;
    }

    public function getCursors(): array
    {
        return $this->cursors;
    }

    public function setCursors(array $cursors): self
    {
        $this->cursors = $cursors;

        return $this;
    }
}
