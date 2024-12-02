<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Interfaces\SluggableInterface;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class NodeSlugTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke(SluggableInterface $node): Type
    {
        if ($node instanceof Organization) {
            return $this->typeResolver->resolve('InternalOrganization');
        }
        if ($node instanceof GlobalDistrict) {
            return $this->typeResolver->resolve('InternalGlobalDistrict');
        }

        throw new UserError('Could not resolve type of Node.');
    }
}
