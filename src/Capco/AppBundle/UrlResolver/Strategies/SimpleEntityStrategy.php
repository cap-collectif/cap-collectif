<?php

namespace Capco\AppBundle\UrlResolver\Strategies;


use Capco\AppBundle\UrlResolver\Specifications\IsStep;

class SimpleEntityStrategy extends AbstractRouteResolver
{
    /**
     * Current entity.
     *
     * @var mixed
     */
    protected $entity;

    /**
     * {@inheritdoc}
     */
    public function resolve($entity)
    {
        $this->entity = $entity;

        if (!$this->isStep()) {
            return; // TODO
        }

        $this->setSubResolver(new StepStrategy());

        return $this->subResolver->resolve($entity);
    }

    /**
     * Check if entity is a step.
     *
     * @return bool
     */
    private function isStep(): bool
    {
        return (new IsStep())->isSatisfiedBy($this->entity);
    }
}
