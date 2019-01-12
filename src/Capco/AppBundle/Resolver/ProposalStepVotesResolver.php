<?php

namespace Capco\AppBundle\Resolver;

use Twig\TwigFilter;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Twig\Extension\AbstractExtension;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalCurrentVotableStepResolver;

class ProposalStepVotesResolver extends AbstractExtension
{
    protected $proposalSelectionVoteRepository;
    protected $selectionStepRepository;
    protected $proposalCollectVoteRepository;
    protected $collectStepRepository;
    protected $proposalRepository;
    private $currentVotableStepResolver;
    private $promiseAdapter;

    public function __construct(
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        SelectionStepRepository $selectionStepRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        CollectStepRepository $collectStepRepository,
        ProposalRepository $proposalRepository,
        ProposalCurrentVotableStepResolver $currentVotableStepResolver,
        PromiseAdapterInterface $promiseAdapter
    ) {
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->selectionStepRepository = $selectionStepRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->collectStepRepository = $collectStepRepository;
        $this->proposalRepository = $proposalRepository;
        $this->currentVotableStepResolver = $currentVotableStepResolver;
        $this->promiseAdapter = $promiseAdapter;
    }

    public function getFilters()
    {
        return [new TwigFilter('current_votable_step', [$this, 'getFirstVotableStepForProposal'])];
    }

    public function voteIsPossible($vote)
    {
        return $this->checkIntanceOfProposalVote($vote);
    }

    public function getAmountSpentForVotes(iterable $votes): int
    {
        $spent = 0;
        foreach ($votes as $vote) {
            $spent += $vote->getProposal()->getEstimation();
        }

        return $spent;
    }

    public function getCreditsLeftByStepIdForProjectAndUser(Project $project, User $user)
    {
        $steps = $project->getSteps()->map(function ($step) {
            return $step->getStep();
        });
        $creditsLeftByStepId = [];
        foreach ($steps as $step) {
            if (
                ($step instanceof SelectionStep || $step instanceof CollectStep) &&
                $step->isBudgetVotable()
            ) {
                $creditsLeft = $step->getBudget();
                if ($creditsLeft > 0 && $user) {
                    $creditsLeft -= $this->getSpentCreditsForUser($user, $step);
                }
                $creditsLeftByStepId[$step->getId()] = $creditsLeft;
            }
        }

        return $creditsLeftByStepId;
    }

    public function getVotableStepsForProject(Project $project)
    {
        $collection = $this->selectionStepRepository->getVotableStepsForProject($project);
        $collectSteps = $this->collectStepRepository->getCollectStepsForProject($project);
        if (\count($collectSteps) > 0) {
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

    public function getFirstVotableStepForProposal(Proposal $proposal): ?AbstractStep
    {
        $step = null;
        $promise = $this->currentVotableStepResolver
            ->__invoke($proposal)
            ->then(function ($value) use (&$step) {
                $step = $value;
            });
        $this->promiseAdapter->await($promise);

        return $step;
    }

    public function hasVotableStepNotFuture(Project $project): bool
    {
        return \count($this->getVotableStepsNotFutureForProject($project)) > 0;
    }

    public function getSpentCreditsForUser(User $user, AbstractStep $step)
    {
        $votes = [];

        if ($step instanceof SelectionStep) {
            $votes = $this->proposalSelectionVoteRepository->getVotesByStepAndUser($step, $user);
        }
        if ($step instanceof CollectStep) {
            $votes = $this->proposalCollectVoteRepository->getVotesByStepAndUser($step, $user);
        }

        return $this->getAmountSpentForVotes($votes);
    }

    private function checkIntanceOfProposalVote($vote)
    {
        switch (true) {
            case $vote instanceof ProposalSelectionVote:
                $step = $vote->getSelectionStep();
                if (!$step->isBudgetVotable()) {
                    return true;
                }
                $connected = $this->proposalSelectionVoteRepository->findBy([
                    'selectionStep' => $step,
                    'user' => $vote->getUser(),
                ]);
                $anonymous = $this->proposalSelectionVoteRepository->findBy([
                    'selectionStep' => $step,
                    'email' => $vote->getEmail(),
                ]);

                break;
            case $vote instanceof ProposalCollectVote:
                $step = $vote->getCollectStep();
                if (!$step->isBudgetVotable()) {
                    return true;
                }
                $connected = $this->proposalCollectVoteRepository->findBy([
                    'collectStep' => $step,
                    'user' => $vote->getUser(),
                ]);
                $anonymous = $this->proposalCollectVoteRepository->findBy([
                    'collectStep' => $step,
                    'email' => $vote->getEmail(),
                ]);

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
}
