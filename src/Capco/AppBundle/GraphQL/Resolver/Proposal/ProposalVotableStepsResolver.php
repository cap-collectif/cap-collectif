<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalVotableStepsResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal): iterable
    {
        $result = [];
        $collect = $proposal->getStep();
        if ($collect && $collect->isVotable()) {
            $result[] = $collect;
        }
        /** @var Selection $selection */
        foreach ($proposal->getSelections() as $selection) {
            if ($selection->getStep()->isVotable()) {
                $result[] = $selection->getStep();
            }
        }

        return $result;
    }
}
