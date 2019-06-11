<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Event;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Resolver\TypeResolver;

class TimeRangeTypeResolver implements ResolverInterface
{
    /**
     * @var TypeResolver
     */
    private $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($node)
    {
        if ($node instanceof Event) {
            return $this->typeResolver->resolve('Event');
        }
    }
}
