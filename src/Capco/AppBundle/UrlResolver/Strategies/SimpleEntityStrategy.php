<?php

namespace Capco\AppBundle\UrlResolver\Strategies;

use Capco\AppBundle\Resolver\StepResolver;
use Capco\AppBundle\UrlResolver\Factories\SimpleRouteFactory;
use Capco\AppBundle\UrlResolver\Specifications\IsStep;

class SimpleEntityStrategy extends AbstractRouteResolver
{
    /**
     * {@inheritdoc}
     */
    public function resolve($entity)
    {
        $this->entity = $entity;

        if ($this->isStep()) {
            $this->setSubResolver(new StepStrategy($this->router));

            return $this->subResolver->resolve($entity);
        }

        $route = (new SimpleRouteFactory())->createRoute($this->entity);

        return $this->router->generate($route->getName(), $route->getParameters(), $route->getPath());
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
