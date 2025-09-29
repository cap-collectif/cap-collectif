<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Interfaces\VotableStepInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalPaperVotesResolver implements QueryInterface
{
    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver
    ) {
    }

    public function __invoke(Proposal $proposal, Argument $args, ?User $viewer = null): Collection
    {
        /** @var AbstractStep $step */
        $step = $this->getStep($args, $viewer);
        if ($step && !$step->canResolverDisplayBallot($viewer)) {
            return new ArrayCollection();
        }

        return $proposal->getPaperVotes();
    }

    protected function getStep(Argument $args, ?User $viewer = null): ?VotableStepInterface
    {
        $step = null;
        $stepId = $args->offsetGet('stepId');
        if ($stepId) {
            $step = $this->globalIdResolver->resolve($args->offsetGet('stepId'), $viewer);
        }

        return $step;
    }
}
