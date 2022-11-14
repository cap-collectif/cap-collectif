<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;

class PostOwnerTypeResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($data): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if (in_array($currentSchemaName, ['dev', 'internal'])) {
            if ($data instanceof User) {
                return $this->typeResolver->resolve('InternalUser');
            }
            if ($data instanceof Organization) {
                return $this->typeResolver->resolve('InternalOrganization');
            }
        }

        throw new UserError('Could not resolve type of PostOwner.');
    }
}
