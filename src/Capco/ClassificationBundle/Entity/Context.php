<?php

namespace Capco\ClassificationBundle\Entity;

use Sonata\ClassificationBundle\Entity\BaseContext;
use Sonata\ClassificationBundle\Model\ContextInterface;

class Context extends BaseContext implements ContextInterface
{
    protected $id;

    public function getId()
    {
        return $this->id;
    }
}
