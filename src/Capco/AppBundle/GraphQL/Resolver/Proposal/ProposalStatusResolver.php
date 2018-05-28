<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Status;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalStatusResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal, Argument $arg): ?Status
    {
        if ($arg->offsetExists('step')) {
            $stepId = $arg->offsetGet('step');
            foreach ($proposal->getSelections() as $selection) {
                if ($selection->getStep()->getId() === $stepId) {
                    return $selection->getStatus();
                }
            }
        }

        return $proposal->getStatus();
    }
}
