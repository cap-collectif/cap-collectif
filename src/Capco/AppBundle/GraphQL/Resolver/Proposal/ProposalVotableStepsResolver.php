<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalVotableStepsResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal): iterable
    {
        // TODO remove me
        return [];
        $result = [];
        $collect = $proposal->getStep();
        if ($collect && $collect->isVotable()) {
            $result[] = $collect;
        }
        foreach ($proposal->getSelections() as $selection) {
            if ($selection->getStep()->isVotable()) {
                $result[] = $selection->getStep();
            }
        }

        return $result;
    }
}
