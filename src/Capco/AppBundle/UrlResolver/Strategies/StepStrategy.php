<?php

namespace Capco\AppBundle\UrlResolver\Strategies;

use Capco\AppBundle\UrlResolver\Factories\StepRouteFactory;

class StepStrategy extends AbstractRouteResolver
{
    public function resolve($entity)
    {
        $this->entity = $entity;

        $route = (new StepRouteFactory())->createRoute($this->entity);

        return $this->router->generate($route->getName(), $route->getParameters(), $route->getPath());
    }
}