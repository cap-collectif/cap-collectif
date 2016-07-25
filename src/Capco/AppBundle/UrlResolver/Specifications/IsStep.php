<?php

namespace Capco\AppBundle\UrlResolver\Specifications;


use Capco\AppBundle\Entity\Steps\AbstractStep;

class IsStep extends AbstractSpecification
{
    /**
     * Chained specification.
     *
     * @var SpecificationInterface
     */
    protected $spec;

    /**
     * IsStep constructor.
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
        return (
            $entity instanceof AbstractStep
            && $this->spec->isSatisfiedBy($entity)
        );
    }
}
