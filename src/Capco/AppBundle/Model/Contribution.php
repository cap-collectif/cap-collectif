<?php

namespace Capco\AppBundle\Model;

use Capco\AppBundle\Elasticsearch\IndexableInterface;

interface Contribution extends CreatableInterface, ExpirableInterface, IndexableInterface
{
    public function getKind(): string;

    public function getRelated();
}
