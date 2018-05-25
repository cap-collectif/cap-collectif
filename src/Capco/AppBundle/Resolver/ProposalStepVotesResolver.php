<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProposalStepVotesResolver
{
    protected $proposalSelectionVoteRepository;
    protected $selectionStepRepository;
    protected $proposalCollectVoteRepository;
    protected $collectStepRepository;
    protected $proposalRepository;

    public function __construct(
      ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
      SelectionStepRepository $selectionStepRepository,
      ProposalCollectVoteRepository $proposalCollectVoteRepository,
      CollectStepRepository $collectStepRepository,
      ProposalRepository $proposalRepository
      ) {
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->selectionStepRepository = $selectionStepRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->collectStepRepository = $collectStepRepository;
        $this->proposalRepository = $proposalRepository;
    }

    public function getUserVotesByStepIdForProject(Project $project, User $user = null)
    {
        $steps = $project->getSteps()->map(function ($step) {
            return $step->getStep();
        });

        $userVotesOnSelectionSteps = $this->proposalSelectionVoteRepository
          ->getUserVotesGroupedByStepIds(
          $steps->filter(function ($step) {
              return $step->isSelectionStep();
          })->map(function ($step) {
              return $step->getId();
          })->toArray(),
          $user
        );
        $userHasVoteOnCollectSteps = $this->proposalCollectVoteRepository
          ->getUserVotesGroupedByStepIds(
          $steps->filter(function ($step) {
              return $step->isCollectStep();
          })->map(function ($step) {
              return $step->getId();
          })->toArray(),
          $user
        );

        return $userVotesOnSelectionSteps + $userHasVoteOnCollectSteps;
    }

    public function voteIsPossible($vote)
    {
        return $this->checkIntanceOfProposalVote($vote);
    }

    public function getAmountSpentForVotes($votes): int
    {
        $spent = 0;
        foreach ($votes as $vote) {
            $spent += $vote->getProposal()->getEstimation();
        }

        return $spent;
    }

    public function getCreditsLeftByStepIdForProjectAndUser(Project $project, User $user = null)
    {
        $steps = $project->getSteps()->map(function ($step) {
            return $step->getStep();
        });
        $creditsLeftByStepId = [];
        foreach ($steps as $step) {
            if (($step instanceof SelectionStep || $step instanceof CollectStep) && $step->isBudgetVotable()) {
                $creditsLeft = $step->getBudget();
                if ($creditsLeft > 0 && $user) {
                    $creditsLeft -= $this->getSpentCreditsForUser($user, $step);
                }
                $creditsLeftByStepId[$step->getId()] = $creditsLeft;
            }
        }

        return $creditsLeftByStepId;
    }

    public function getVotableStepsForProposal(Proposal $proposal)
    {
        $votableSteps = new ArrayCollection();
        $collectStep = $proposal->getProposalForm()->getStep();
        if ($collectStep->isVotable()) {
            $votableSteps->add($collectStep);
        }
        $selectionSteps = $this
          ->selectionStepRepository
          ->getVotableStepsForProposal($proposal)
        ;
        foreach ($selectionSteps as $step) {
            $votableSteps->add($step);
        }

        return $votableSteps;
    }

    public function getVotableStepsForProject(Project $project)
    {
        $collection = $this
            ->selectionStepRepository
            ->getVotableStepsForProject($project)
        ;
        $collectSteps = $this->collectStepRepository->getCollectStepsForProject($project);
        if (count($collectSteps) > 0) {
            $step = $collectSteps[0];
            if ($step->isVotable()) {
                array_push($collection, $step);
            }
        }

        return $collection;
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

    public function hasVotableStepNotFuture(Project $project): bool
    {
        return count($this->getVotableStepsNotFutureForProject($project)) > 0;
    }

    private function checkIntanceOfProposalVote($vote)
    {
        switch (true) {
            case $vote instanceof ProposalSelectionVote:
                $step = $vote->getSelectionStep();
                if (!$step->isBudgetVotable()) {
                    return true;
                }
                $connected = $this->proposalSelectionVoteRepository->findBy(['selectionStep' => $step, 'user' => $vote->getUser()]);
                $anonymous = $this->proposalSelectionVoteRepository->findBy(['selectionStep' => $step, 'email' => $vote->getEmail()]);
                break;
            case $vote instanceof ProposalCollectVote:
                $step = $vote->getCollectStep();
                if (!$step->isBudgetVotable()) {
                    return true;
                }
                $connected = $this->proposalCollectVoteRepository->findBy(['collectStep' => $step, 'user' => $vote->getUser()]);
                $anonymous = $this->proposalCollectVoteRepository->findBy(['collectStep' => $step, 'email' => $vote->getEmail()]);
                break;
            default:
                throw new NotFoundHttpException();
        }

        $proposal = $vote->getProposal();
        $otherVotes = [];
        if ($vote->getUser()) {
            $otherVotes = $connected;
        } elseif ($vote->getEmail()) {
            $otherVotes = $anonymous;
        }

        if (!$step->isVotable()) {
            return false;
        }

        if ($vote instanceof ProposalSelectionVote || $vote instanceof ProposalCollectVote) {
            if ($step->isBudgetVotable() && $step->getBudget()) {
                $left = $step->getBudget() - $this->getAmountSpentForVotes($otherVotes);

                return $left >= $proposal->getEstimation();
            }
        }

        return true;
    }

    private function getSpentCreditsForUser(User $user, AbstractStep $step)
    {
        $votes = [];

        if ($step instanceof SelectionStep) {
            $votes = $this
              ->proposalSelectionVoteRepository
              ->getVotesByStepAndUser($step, $user)
          ;
        }
        if ($step instanceof CollectStep) {
            $votes = $this
              ->proposalCollectVoteRepository
              ->getVotesByStepAndUser($step, $user)
          ;
        }

        return $this->getAmountSpentForVotes($votes);
    }
}
