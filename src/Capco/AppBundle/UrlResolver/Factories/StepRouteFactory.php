<?php

namespace Capco\AppBundle\UrlResolver\Factories;

use Capco\AppBundle\UrlResolver\RoutesRegistry;

class StepRouteFactory extends AbstractRouteFactory
{
    /**
     * Create a route object.
     *
     * @return void
     */
    public function createName()
    {
        $entityName = (new \ReflectionClass(get_class($this->entity)))->getName();

        $this->route->setName(RoutesRegistry::get($entityName));
    }

    /**
     * Create all parameters for a route.
     *
     * @return void
     */
    public function createParameters()
    {
        $this->route->setParameters(
            ['projectSlug' => $this->entity->getProject()->getSlug(), 'stepSlug' => $this->entity->getSlug()]
        );
    }
}