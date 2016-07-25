<?php

namespace Capco\AppBundle\UrlResolver\Specifications;


class HasParent extends AbstractSpecification
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
        return (method_exists($entity, 'getParent') && $entity->getParent());
    }
}
