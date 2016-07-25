<?php

namespace Capco\AppBundle\UrlResolver\Strategies;

use Capco\AppBundle\UrlResolver\Factories\WithParentRouteFactory;
use Capco\AppBundle\UrlResolver\Specifications\HasParent;

class WithParentStrategy extends AbstractRouteResolver
{
    /**
     * {@inheritdoc}
     */
    public function resolve($entity)
    {
        $this->entity = $entity;

        if (!$this->hasParent()) {
            throw new \LogicException('Entity has no parent!');
        }

        $route = (new WithParentRouteFactory())->createRoute($this->entity);

        return $this->router->generate($route->getName(), $route->getParameters(), $route->getPath());
    }

    /**
     * Check if $entity has a parent.
     *
     * @return bool
     */
    private function hasParent(): bool
    {
        return (new HasParent())->isSatisfiedBy($this->entity);
    }
}
