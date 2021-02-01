<?php

namespace Capco\AppBundle\GraphQL\Resolver\Updatable;

use GraphQL\Type\Definition\Type;
use Capco\AppBundle\Entity\Reply;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UpdatableTypeResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($node): Type
    {
        if ($node instanceof Reply) {
            return $this->typeResolver->resolve('InternalReply');
        }

        throw new UserError('Could not resolve type of Updatable.');
    }
}
