<?php

namespace Capco\AppBundle\Elasticsearch;

use Elastica\Result;

class HybridResult
{
    protected $result;

    public function __construct(
        Result $result,
        protected $transformed = null
    ) {
        $this->result = $result;
    }

    public function getTransformed()
    {
        return $this->transformed;
    }

    public function getResult(): Result
    {
        return $this->result;
    }
}
