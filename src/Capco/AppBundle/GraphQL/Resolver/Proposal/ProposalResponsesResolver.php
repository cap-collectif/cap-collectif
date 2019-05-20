<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;

class ProposalResponsesResolver implements ResolverInterface
{
    use ResponsesResolverTrait;

    public function __invoke(Proposal $proposal, $viewer, \ArrayObject $context): iterable
    {
        $responses = $this->filterVisibleResponses(
            $proposal->getResponses(),
            $proposal->getAuthor(),
            $viewer,
            $context
        );
        $iterator = $responses->getIterator();

        $iterator->uasort(function ($a, $b) {
            return $a->getQuestion()->getPosition() - $b->getQuestion()->getPosition();
        });

        return $iterator;
    }
}
