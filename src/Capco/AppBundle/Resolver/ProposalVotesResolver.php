<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalVoteRepository;
use Capco\UserBundle\Entity\User;

class ProposalVotesResolver
{
    protected $repository;
    protected $userVotesForSelectionSteps = [];

    public function __construct(ProposalVoteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function addVotesToProposalsForSelectionStepAndUser(array $proposals, SelectionStep $selectionStep, User $user)
    {
        $this->usersVotesForSelectionStep = $this
            ->repository
            ->findBy(
                [
                    'selectionStep' => $selectionStep,
                    'user' => $user,
                ]
            );
        $results = [];
        foreach ($proposals as $proposal) {
            $proposal['userHasVote'] = $this->proposalHasVote($proposal);
            $results[] = $proposal;
        }

        return $results;
    }

    public function proposalHasVote($proposal)
    {
        foreach ($this->usersVotesForSelectionStep as $vote) {
            if ($vote->getProposal()->getId() === $proposal['id']) {
                return true;
            }
        }

        return false;
    }
}
