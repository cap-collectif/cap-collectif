<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalSelectionsResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal): array
    {
        $selections = $proposal->getSelections()->toArray();

        usort($selections, function ($selection1, $selection2) {
            return $selection1->getStep()->getProjectAbstractStep()->getPosition() > $selection2->getStep()->getProjectAbstractStep()->getPosition();
        });

        return $selections;
    }
}
