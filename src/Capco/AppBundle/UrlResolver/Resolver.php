<?php

namespace Capco\AppBundle\UrlResolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\UrlResolver\Specifications\HasSlug;
use Capco\AppBundle\UrlResolver\Strategies\RouteResolverInterface;
use Capco\AppBundle\UrlResolver\Strategies\SimpleEntityStrategy;
use Capco\AppBundle\UrlResolver\Strategies\WithParentStrategy;
use Symfony\Component\Routing\Router;

class Resolver
{
    /**
     * Entity to generate.
     *
     * @var mixed
     */
    protected $entity;

    /**
     * Strategy to adopt.
     *
     * @var RouteResolverInterface
     */
    protected $resolver;

    /**
     * SF Router.
     *
     * @var Router
     */
    protected $router;

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

        if ($this->hasSlug()) {
            return 'n/a';
        }

        if($this->entity instanceof Source || $this->entity instanceof Argument) {
            $this->setStrategy(new WithParentStrategy($this->router));
        } else {
            $this->setStrategy(new SimpleEntityStrategy($this->router));
        }

        return $this->resolver->resolve($entity);
    }

    protected function setStrategy(RouteResolverInterface $resolver)
    {
        $this->resolver = $resolver;
    }

    /**
     * Check if entity has a slug.
     *
     * @return bool
     */
    private function hasSlug(): bool
    {
        return (new HasSlug())->isSatisfiedBy($this->entity);
    }
}