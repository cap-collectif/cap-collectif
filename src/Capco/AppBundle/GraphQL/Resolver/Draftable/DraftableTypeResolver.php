<?php

namespace Capco\AppBundle\GraphQL\Resolver\Draftable;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class DraftableTypeResolver implements QueryInterface
{
    public function __construct(
        private readonly TypeResolver $typeResolver
    ) {
    }

    public function __invoke($node): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($node instanceof Proposal) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposal');
            }

            return $this->typeResolver->resolve('InternalProposal');
        }
        if ($node instanceof Reply) {
            return $this->typeResolver->resolve('InternalReply');
        }

        throw new UserError('Could not resolve type of Draftable.');
    }
}
