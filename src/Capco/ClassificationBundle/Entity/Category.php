<?php

namespace Capco\ClassificationBundle\Entity;

use Sonata\ClassificationBundle\Entity\BaseCategory;

class Category extends BaseCategory
{
    protected $id;

    public function getId()
    {
        return $this->id;
    }
}
