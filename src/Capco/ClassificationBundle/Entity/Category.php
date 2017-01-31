<?php

namespace Capco\ClassificationBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Sonata\ClassificationBundle\Entity\BaseCategory;

class Category extends BaseCategory
{
    protected $id;

    public function getId()
    {
        return $this->id;
    }

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->children = new ArrayCollection();
    }
}
