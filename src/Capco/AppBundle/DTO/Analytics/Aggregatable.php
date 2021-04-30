<?php

namespace Capco\AppBundle\DTO\Analytics;

interface Aggregatable
{
    public function getTotalCount(): int;

    public function getValues(): iterable;
}
