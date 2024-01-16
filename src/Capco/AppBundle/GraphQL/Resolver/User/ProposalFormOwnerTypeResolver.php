<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ProposalFormOwnerTypeResolver implements QueryInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($user): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ('internal' === $currentSchemaName && $user instanceof User) {
            return $this->typeResolver->resolve('InternalUser');
        }

        throw new UserError('Could not resolve type of ProposalFormOwner.');
    }
}
