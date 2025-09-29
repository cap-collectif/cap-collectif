<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalStepPaperVoteCounterRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalStepPaperVoteTotalCountResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalStepPaperVoteCounterRepository $repository,
        private readonly GlobalIdResolver $globalIdResolver
    ) {
    }

    public function __invoke(Proposal $proposal, Argument $args, ?User $viewer = null): int
    {
        return $this->count($proposal, $this->getStep($args, $viewer), $viewer);
    }

    protected function getPaperVotes(Proposal $proposal, ?AbstractStep $step): array
    {
        return $this->repository->findBy(self::getRepositoryCriteria($proposal, $step));
    }

    protected function getStep(Argument $args, ?User $viewer = null): ?AbstractStep
    {
        $step = null;
        $stepId = $args->offsetGet('stepId');
        if ($stepId) {
            $step = $this->globalIdResolver->resolve($args->offsetGet('stepId'), $viewer);
        }

        return $step;
    }

    private function count(Proposal $proposal, ?AbstractStep $step, ?User $viewer = null): int
    {
        $counter = 0;
        if ($step && !$step->canResolverDisplayBallot($viewer)) {
            return $counter;
        }

        foreach ($this->getPaperVotes($proposal, $step) as $paperVote) {
            $counter += $paperVote->getTotalCount();
        }

        return $counter;
    }

    private static function getRepositoryCriteria(Proposal $proposal, ?AbstractStep $step): array
    {
        $criteria = ['proposal' => $proposal];
        if ($step) {
            $criteria['step'] = $step;
        }

        return $criteria;
    }
}
