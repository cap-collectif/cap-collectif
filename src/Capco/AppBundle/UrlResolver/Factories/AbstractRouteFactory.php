<?php

namespace Capco\AppBundle\UrlResolver\Factories;


use Capco\AppBundle\UrlResolver\Route;

abstract class AbstractRouteFactory
{
    /**
     * @var Route
     */
    protected $route;

    /**
     * Current entity.
     *
     * @var mixed
     */
    protected $entity;

    /**
     * AbstractRouteFactory constructor.
     *
     * @param null|Route $route
     */
    public function __construct(Route $route = null)
    {
        $this->route = $route ?: new Route();
    }

    public function createRoute($entity)
    {
        $this->entity = $entity;

        $this->createName();
        $this->createParameters();

        return $this->route;
    }

    /**
     * Create a route object.
     *
     * @return void
     */
    abstract protected function createName();

    /**
     * Create all parameters for a route.
     *
     * @return void
     */
    abstract protected function createParameters();
}