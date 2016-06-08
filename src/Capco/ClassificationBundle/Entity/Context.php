<?php

namespace Capco\ClassificationBundle\Entity;

use Sonata\ClassificationBundle\Entity\BaseContext as BaseContext;
use Sonata\ClassificationBundle\Model\ContextInterface;

class Context extends BaseContext implements ContextInterface
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
