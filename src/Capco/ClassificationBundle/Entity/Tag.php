<?php

namespace Capco\ClassificationBundle\Entity;

use Sonata\ClassificationBundle\Entity\BaseTag as BaseTag;

class Tag extends BaseTag
{
    protected $id;

    /**
     * Get id.
     *
     * @return int $id
     */
    public function getId()
    {
        return $this->id;
    }
}
