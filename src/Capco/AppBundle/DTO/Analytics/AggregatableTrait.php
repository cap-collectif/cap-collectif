<?php

namespace Capco\AppBundle\DTO\Analytics;

trait AggregatableTrait
{
    private int $totalCount;

    private iterable $values;

    public function getTotalCount(): int
    {
        return $this->totalCount;
    }

    public function getValues(): iterable
    {
        return $this->values;
    }
}
