<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalReferenceResolver implements QueryInterface
{
    public function __invoke(Proposal $proposal, ?Argument $args = null): string
    {
        if (!$args) {
            return $proposal->getFullReference();
        }

        if ($args->offsetExists('full')) {
            return true === $args->offsetGet('full')
                ? $proposal->getFullReference()
                : $proposal->getReference();
        }

        return $proposal->getFullReference();
    }
}
