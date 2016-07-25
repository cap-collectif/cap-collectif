<?php

namespace Capco\AppBundle\UrlResolver;


use Symfony\Component\Routing\Router;

class Resolver
{
    /**
     * SF Router.
     *
     * @var Router
     */
    protected $router;

    /**
     * Entity to generate.
     *
     * @var mixed
     */
    protected $entity;

    /**
     * Resolver constructor.
     *
     * @param Router $router
     */
    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    /**
     * Resolve the route for a given entity.
     *
     * @param $entity doctrine Entity.
     *
     * @return string
     */
    public function route($entity): string
    {
        $this->entity = $entity;
    }

    protected function detectEntity()
    {

    }

}