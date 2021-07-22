<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;

class QuestionnaireOwnerTypeResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($data): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ('internal' === $currentSchemaName && $data instanceof User) {
            return $this->typeResolver->resolve('InternalUser');
        }

        throw new UserError('Could not resolve type of QuestionnaireOwner.');
    }
}
