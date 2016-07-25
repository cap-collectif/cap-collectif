<?php

namespace Capco\AppBundle\UrlResolver\Specifications;


use Capco\AppBundle\Entity\Steps\AbstractStep;

class IsStep extends AbstractSpecification
{
    /**
     * Checks if given item meets all criteria.
     *
     * @param $entity
     *
     * @return bool
     */
    public function isSatisfiedBy($entity): bool
    {
        return $entity instanceof AbstractStep;
    }
}
