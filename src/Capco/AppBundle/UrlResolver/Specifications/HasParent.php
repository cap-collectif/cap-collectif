<?php

namespace Capco\AppBundle\UrlResolver\Specifications;


class HasParent extends AbstractSpecification
{
    /**
     * Chained spec.
     *
     * @var SpecificationInterface
     */
    protected $spec;

    /**
     * NeedParent constructor.
     *
     * @param SpecificationInterface $spec
     */
    public function __construct(SpecificationInterface $spec)
    {
        $this->spec = $spec;
    }

    /**
     * Checks if given item meets all criteria.
     *
     * @param $entity
     *
     * @return bool
     */
    public function isSatisfiedBy($entity): bool
    {
        return (method_exists($entity, 'getParent') && $entity->getParent() && $this->spec->isSatisfiedBy($entity));
    }
}
