<?php

namespace Capco\AppBundle\UrlResolver\Strategies;


use Capco\AppBundle\UrlResolver\Specifications\HasParent;

class WithParentStrategy extends AbstractRouteResolver
{
    /**
     * @var mixed
     */
    protected $entity;

    /**
     * {@inheritdoc}
     */
    public function resolve($entity)
    {
        $this->entity = $entity;

        if ($this->hasParent()) {
            throw new \LogicException('No parent for an entity which needs a parent.');
        }

        $this->setSubResolver(new SimpleEntityStrategy());

        return $this->subResolver->resolve($entity);
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