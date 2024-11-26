<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class PostOwnerTypeResolver implements QueryInterface
{
    private readonly TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($data): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if (\in_array($currentSchemaName, ['dev', 'internal'])) {
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
