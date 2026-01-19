<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalStepVoteTypesResolver implements QueryInterface
{
    /**
     * @return list<string>
     */
    public function __invoke(CollectStep|SelectionStep $step): array
    {
        if (!$step->isVotable()) {
            return ['DISABLED'];
        }

        $voteTypes = [];

        if (null !== $step->getVotesLimit()) {
            $voteTypes[] = 'MAX';
        }
        if (null !== $step->getVotesMin()) {
            $voteTypes[] = 'MIN';
        }
        if ($step->hasVoteThreshold()) {
            $voteTypes[] = 'THRESHOLD';
        }
        if ($step->getBudget()) {
            $voteTypes[] = 'BUDGET';
        }
        if ($step->isVotesRanking()) {
            $voteTypes[] = 'RANKING';
        }
        if ($step->isSecretBallot()) {
            $voteTypes[] = 'SECRET_BALLOT';
        }

        if ([] === $voteTypes) {
            return ['SIMPLE'];
        }

        return $voteTypes;
    }
}
