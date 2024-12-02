<?php

namespace Capco\AppBundle\GraphQL\Resolver\Publishable;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\AppBundle\Model\Publishable;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class PublishableTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke(Publishable $node): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($node instanceof Opinion) {
            return $this->typeResolver->resolve('Opinion');
        }
        if ($node instanceof Proposal) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposal');
            }

            return $this->typeResolver->resolve('InternalProposal');
        }

        if ($node instanceof OpinionVersion) {
            return $this->typeResolver->resolve('Version');
        }
        if ($node instanceof Argument) {
            return $this->typeResolver->resolve('Argument');
        }
        if ($node instanceof Source) {
            return $this->typeResolver->resolve('Source');
        }
        if ($node instanceof Comment) {
            return $this->typeResolver->resolve('Comment');
        }

        throw new UserError('Could not resolve type of Publishable.');
    }
}
