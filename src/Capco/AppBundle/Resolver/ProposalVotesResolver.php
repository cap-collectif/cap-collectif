<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalVoteRepository;
use Capco\UserBundle\Entity\User;

class ProposalVotesResolver
{
    protected $repository;

    public function __construct(ProposalVoteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function addVotesToProposalsForSelectionStepAndUser(array $proposals, SelectionStep $selectionStep, User $user)
    {
        $usersVotesForSelectionStep = $this
            ->repository
            ->findBy(
                [
                    'selectionStep' => $selectionStep,
                    'user' => $user,
                ]
            );
        $results = [];
        foreach ($proposals as $proposal) {
            $proposal['userHasVote'] = $this->proposalHasVote($proposal, $usersVotesForSelectionStep);
            $results[] = $proposal;
        }

        return $results;
    }

    public function proposalHasVote($proposal, $usersVotesForSelectionStep)
    {
        foreach ($usersVotesForSelectionStep as $vote) {
            if ($vote->getProposal()->getId() === $proposal['id']) {
                return true;
            }
        }

        return false;
    }
}
