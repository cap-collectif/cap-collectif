<?php

namespace Capco\AppBundle\UrlResolver\Specifications;

interface SpecificationInterface
{
    /**
     * A boolean evaluation indicating if the object meets the specification.
     *
     * @param $entity
     *
     * @return bool
     */
    public function isSatisfiedBy($entity): bool;

    /**
     * Detect if an entity has a slug.
     *
     * @return void
     */
    public function hasSlug();

    /**
     * Detect if an entity is a Step.
     *
     * @param SpecificationInterface $spec
     *
     * @return void
     */
    public function isStep(SpecificationInterface $spec);

    /**
     * Detect if an entity needs its parent.
     *
     * @return void
     */
    public function hasParent();
}