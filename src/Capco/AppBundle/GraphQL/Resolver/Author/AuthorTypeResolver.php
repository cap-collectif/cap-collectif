<?php

namespace Capco\AppBundle\GraphQL\Resolver\Author;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class AuthorTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke($node)
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($node instanceof Organization) {
            return $this->typeResolver->resolve('InternalOrganization');
        }
        if ($node instanceof User) {
            if ('public' === $currentSchemaName) {
                return $this->typeResolver->resolve('PublicUser');
            }
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewUser');
            }

            return $this->typeResolver->resolve('InternalUser');
        }

        throw new UserError('Could not resolve type of Author.');
    }
}
