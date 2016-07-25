<?php

namespace Capco\AppBundle\UrlResolver\Specifications;

abstract class AbstractSpecification implements SpecificationInterface
{
    /**
     * Entity given.
     *
     * @var mixed
     */
    protected $entity;

    /**
     * Checks if given item meets all criteria.
     *
     * @param $entity
     *
     * @return bool
     */
    abstract public function isSatisfiedBy($entity): bool;

    /**
     * {@inheritdoc}
     */
    public function hasSlug()
    {
        return new HasSlug();
    }

    /**
     * {@inheritdoc}
     */
    public function isStep(SpecificationInterface $spec)
    {
        return new IsStep($spec);
    }

    /**
     * {@inheritdoc}
     */
    public function hasParent()
    {
        return new HasParent();
    }
}