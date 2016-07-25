<?php

namespace Capco\AppBundle\UrlResolver\Strategies;


abstract class AbstractRouteResolver implements RouteResolverInterface
{
    /**
     * Sub route resolver.
     *
     * @var RouteResolverInterface
     */
    protected $subResolver;

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
