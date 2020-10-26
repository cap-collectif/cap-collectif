<?php

namespace Capco\AppBundle\Model;

use Capco\AppBundle\Elasticsearch\IndexableInterface;

interface Contribution extends CreatableInterface, IndexableInterface
{
    /**
     * @deprecated we should not need this anymore
     */
    public function getKind(): string;

    public function getRelated();
}
