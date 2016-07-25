<?php

namespace Capco\AppBundle\UrlResolver\Specifications;

class HasSlug extends AbstractSpecification
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
        return (method_exists($entity, 'getSlug') && $entity->getSlug() && !empty($entity->getSlug()));
    }
}