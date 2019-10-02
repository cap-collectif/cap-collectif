<?php

namespace Capco\AppBundle\Elasticsearch;

class ElasticsearchPaginatedResult
{
    private $entities;

    private $totalCount;

    private $cursors;

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

    public function setTotalCount(int $totalCount): self
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
