<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalStepPaperVoteTotalPointsCountResolver
    extends ProposalStepPaperVoteTotalCountResolver
    implements ResolverInterface
{
    public function __invoke(Proposal $proposal, Argument $args, ?User $viewer = null): int
    {
        return $this->count($proposal, $this->getStep($args, $viewer));
    }

    private function count(Proposal $proposal, ?AbstractStep $step): int
    {
        $counter = 0;

        foreach ($this->getPaperVotes($proposal, $step) as $paperVote) {
            $counter += $paperVote->getTotalPointsCount();
        }

        return $counter;
    }
}
