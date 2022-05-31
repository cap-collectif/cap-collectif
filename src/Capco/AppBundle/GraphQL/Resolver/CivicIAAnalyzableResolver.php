<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Responses\ValueResponse;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;

class CivicIAAnalyzableResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($data): Type
    {
        if ($data instanceof ValueResponse) {
            return $this->typeResolver->resolve('InternalValueResponse');
        }

        throw new UserError('Could not resolve type of CivicIAAnalyzable.');
    }
}
