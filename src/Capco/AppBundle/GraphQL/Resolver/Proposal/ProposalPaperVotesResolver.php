<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Interfaces\VotableStepInterface;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalPaperVotesResolver implements ResolverInterface
{
    private GlobalIdResolver $globalIdResolver;

    public function __construct(GlobalIdResolver $globalIdResolver)
    {
        $this->globalIdResolver = $globalIdResolver;
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
