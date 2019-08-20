<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Resolver\TypeResolver as OverblogTypeResolver;

class TypeResolver
{
    private $typeResolver;

    public function __construct(OverblogTypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    // TODO make a PR to add this method to overblog/GraphQLBundle
    public function getCurrentSchemaName(): string
    {
        $reflection = new \ReflectionClass($this->typeResolver);
        $property = $reflection->getProperty('currentSchemaName');
        $property->setAccessible(true);

        return $property->getValue($this->typeResolver);
    }

    public function resolve(string $alias): ?Type
    {
        return $this->typeResolver->resolve($alias);
    }
}
