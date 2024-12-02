<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ConsultationOwnerTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke($data): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($data instanceof User) {
            $types = [
                'dev' => 'InternalUser',
                'internal' => 'InternalUser',
                'preview' => 'PreviewUser',
                'public' => 'PublicUser',
            ];
            $type = $types[$currentSchemaName];

            return $this->typeResolver->resolve($type);
        }

        if ($data instanceof Organization) {
            return $this->typeResolver->resolve('InternalOrganization');
        }

        throw new UserError('Could not resolve type of ConsultationOwner.');
    }
}
