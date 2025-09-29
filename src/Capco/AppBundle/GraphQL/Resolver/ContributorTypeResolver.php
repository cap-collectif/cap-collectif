<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ContributorTypeResolver implements QueryInterface
{
    public function __construct(
        private readonly TypeResolver $typeResolver
    ) {
    }

    public function __invoke(ContributorInterface $node): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($node instanceof User) {
            if (\in_array($currentSchemaName, ['internal', 'dev'])) {
                return $this->typeResolver->resolve('InternalUser');
            }
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewUser');
            }
        }

        if ($node instanceof Participant) {
            return $this->typeResolver->resolve('InternalParticipant');
        }

        throw new UserError('Could not resolve type of Contributor.');
    }
}
