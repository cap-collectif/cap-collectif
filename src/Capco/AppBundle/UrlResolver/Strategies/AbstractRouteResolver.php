<?php

namespace Capco\AppBundle\UrlResolver\Strategies;


use Symfony\Component\Routing\Router;

abstract class AbstractRouteResolver implements RouteResolverInterface
{
    /**
     * Sub route resolver.
     *
     * @var RouteResolverInterface
     */
    protected $subResolver;

    /**
     * Current entity.
     *
     * @var mixed
     */
    protected $entity;

    /**
     * SF Router.
     *
     * @var Router
     */
    protected $router;

    /**
     * AbstractRouteResolver constructor.
     *
     * @param Router $router
     */
    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    /**
     * {@inheritdoc}
     */
    abstract public function resolve($entity);

    /**
     * @param RouteResolverInterface $subResolver
     */
    public function setSubResolver(RouteResolverInterface $subResolver)
    {
        $this->subResolver = $subResolver;
    }
}
