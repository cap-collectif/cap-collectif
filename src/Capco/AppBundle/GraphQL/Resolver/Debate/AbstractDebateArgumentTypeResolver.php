<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;

class AbstractDebateArgumentTypeResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(DebateArgumentInterface $argument): Type
    {
        if ($argument instanceof DebateArgument) {
            return $this->typeResolver->resolve('InternalDebateArgument');
        }
        if ($argument instanceof DebateAnonymousArgument) {
            return $this->typeResolver->resolve('InternalDebateAnonymousArgument');
        }

        throw new UserError('Could not resolve type of AbstractDebateArgument.');
    }
}
