<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalVoteRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\UserBundle\Entity\User;

class ProposalVotesResolver
{
    protected $proposalVoteRepository;
    protected $selectionStepRepository;

    public function __construct(ProposalVoteRepository $proposalVoteRepository, SelectionStepRepository $selectionStepRepository)
    {
        $this->proposalVoteRepository = $proposalVoteRepository;
        $this->selectionStepRepository = $selectionStepRepository;
    }

    public function addVotesToProposalsForSelectionStepAndUser(array $proposals, SelectionStep $selectionStep, User $user)
    {
        $usersVotesForSelectionStep = $this
            ->proposalVoteRepository
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

    public function voteIsPossible(ProposalVote $vote)
    {
        $selectionStep = $vote->getSelectionStep();
        $proposal = $vote->getProposal();
        $otherVotes = [];
        if ($vote->getUser()) {
            $otherVotes = $this
                ->proposalVoteRepository
                ->findBy(
                    [
                        'selectionStep' => $selectionStep,
                        'user' => $vote->getUser(),
                    ]
                )
            ;
        } elseif ($vote->getEmail()) {
            $otherVotes = $this
                ->proposalVoteRepository
                ->findBy(
                    [
                        'selectionStep' => $selectionStep,
                        'email' => $vote->getEmail(),
                    ]
                )
            ;
        }

        if (!$selectionStep->isVotable()) {
            return false;
        }
        if ($selectionStep->isBudgetVotable() && $selectionStep->getBudget()) {
            $left = $selectionStep->getBudget() - $this->getAmountSpentForVotes($otherVotes);

            return $left >= $proposal->getEstimation();
        }

        return true;
    }

    public function getAmountSpentForVotes(array $votes)
    {
        $spent = 0;
        foreach ($votes as $vote) {
            $spent += $vote->getProposal()->getEstimation();
        }

        return $spent;
    }

    public function getSpentCreditsForUser(User $user, SelectionStep $selectionStep)
    {
        $votes = $this
            ->proposalVoteRepository
            ->findBy(
                [
                    'selectionStep' => $selectionStep,
                    'user' => $user,
                ]
            )
        ;

        return $this->getAmountSpentForVotes($votes);
    }

    public function getCreditsLeftForUser(User $user = null, SelectionStep $selectionStep)
    {
        $creditsLeft = $selectionStep->getBudget();
        if ($creditsLeft > 0 && $user && $selectionStep->isBudgetVotable()) {
            $creditsLeft -= $this
                ->getSpentCreditsForUser($user, $selectionStep)
            ;
        }

        return $creditsLeft;
    }

    public function getVotableStepsForProposal(Proposal $proposal)
    {
        return $this
            ->selectionStepRepository
            ->getVotableStepsForProposal($proposal)
        ;
    }

    public function getVotableStepsForProject(Project $project)
    {
        return $this
            ->selectionStepRepository
            ->getVotableStepsForProject($project)
        ;
    }

    public function getVotableStepsNotFutureForProject(Project $project)
    {
        $steps = [];
        foreach ($this->getVotableStepsForProject($project) as $step) {
            if (!$step->isFuture()) {
                $steps[] = $step;
            }
        }
        return $steps;
    }

    public function getFirstVotableStepForProposal(Proposal $proposal)
    {
        $votableSteps = $this->getVotableStepsForProposal($proposal);
        $firstVotableStep = null;
        foreach ($votableSteps as $step) {
            if ($step->isOpen()) {
                $firstVotableStep = $step;
                break;
            }
        }
        if (!$firstVotableStep) {
            foreach ($votableSteps as $step) {
                if ($step->isFuture()) {
                    $firstVotableStep = $step;
                    break;
                }
            }
        }
        if (!$firstVotableStep) {
            foreach ($votableSteps as $step) {
                if ($step->isClosed()) {
                    $firstVotableStep = $step;
                    break;
                }
            }
        }

        return $firstVotableStep;
    }

    public function hasVotableStepNotFuture(Project $project)
    {
        return count($this->getVotableStepsNotFutureForProject($project)) > 0;
    }

    public function getVotesCountForUserInSelectionStep(User $user, SelectionStep $step)
    {
        return $this
            ->proposalVoteRepository
            ->countForUserAndStep($user, $step)
        ;
    }

    public function getVotesForUserInSelectionStep(User $user, SelectionStep $step)
    {
        return $this
            ->proposalVoteRepository
            ->getVotesForUserInStep($user, $step)
        ;
    }
}
