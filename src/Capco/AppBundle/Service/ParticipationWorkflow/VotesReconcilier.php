<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Doctrine\ORM\EntityManagerInterface;

class VotesReconcilier extends ContributionsReconcilier
{
    public function __construct(
        EntityManagerInterface $em,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly SelectionStepRepository $selectionStepRepository,
        private readonly CollectStepRepository $collectStepRepository,
        private readonly Indexer $indexer,
    ) {
        parent::__construct($em);
    }

    public function reconcile(Participant $participant, ContributorInterface $contributorTarget): void
    {
        if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        $selectionSteps = $this->selectionStepRepository->findByParticipantWithVotes($participant);
        $collectSteps = $this->collectStepRepository->findByParticipantWithVotes($participant);

        $steps = array_merge($selectionSteps, $collectSteps);

        $isSameEmail = $participant->getEmail() === $contributorTarget->getEmail() && ($participant->isEmailConfirmed() && $contributorTarget->isEmailConfirmed());

        /** * @var SelectionStep $step  */
        foreach ($steps as $step) {
            if ($step->isClosed()) {
                continue;
            }

            $hasEmailVerifiedRequirement = $step->getRequirements()->filter(fn (Requirement $requirement) => Requirement::EMAIL_VERIFIED === $requirement->getType())->count() > 0;

            if (!$hasEmailVerifiedRequirement) {
                continue;
            }

            // if participant has an email different from the user we skip reconciling because we consider that they are not the same person
            // otherwise if he has no email set we can reconcile with the logged-in user assuming he is logged-in through the workflow with either email password / sso / magic link
            if (null !== $participant->getEmail() && !$isSameEmail) {
                continue;
            }
            $this->reconcileByStep($step, $participant, $contributorTarget);
        }
    }

    public function reconcileByStep(ProposalStepInterface $step, Participant $participant, ContributorInterface $contributorTarget): void
    {
        $repository = $step instanceof CollectStep ? $this->proposalCollectVoteRepository : $this->proposalSelectionVoteRepository;

        $votesRanking = $step->isVotesRanking();
        $budget = $step->getBudget();

        $votesMin = $step->getVotesMin();
        $votesMinEnabled = null !== $votesMin;

        $votesLimit = $step->getVotesLimit();
        $votesLimitEnabled = null !== $votesLimit;

        /** * @var array<ProposalSelectionVote> $participantVotes  */
        $targetContributorVotes = $repository->getVotesByStepAndContributor($step, $contributorTarget, false);

        /** * @var array<ProposalSelectionVote> $participantVotes  */
        $participantVotes = $repository->getVotesByStepAndContributor($step, $participant, false);

        $targetContributorHasReachedVotesMin = $votesMinEnabled && \count($targetContributorVotes) >= $votesMin;
        $targetContributorHasReachedVotesLimit = $votesLimitEnabled && \count($targetContributorVotes) === $votesLimit;

        $participantHasReachedVoteMin = $votesMinEnabled && \count($participantVotes) >= $votesMin;
        $participantHasReachedVotesLimit = $votesLimitEnabled && \count($participantVotes) === $votesLimit;

        $targetContributorVotesProposalsMap = [];
        foreach ($targetContributorVotes as $targetContributorVote) {
            $targetContributorVotesProposalsMap[$targetContributorVote->getProposal()->getId()] = $targetContributorVote;
        }
        $targetContributorVotesProposals = array_keys($targetContributorVotesProposalsMap);

        switch (true) {
            /*
             * max = 2
             * user => A
             * participant => B C
             * result => B C
             */
            case $votesLimitEnabled && !$targetContributorHasReachedVotesLimit && $participantHasReachedVotesLimit:
                foreach ($targetContributorVotes as $targetContributorVote) {
                    $this->em->remove($targetContributorVote);
                }
                $this->em->flush();
                foreach ($participantVotes as $vote) {
                    $vote->setContributor($contributorTarget);
                }
                $this->em->flush();

                return;
            /*
             * min = 2
             * max = 4
             * user => A B
             * participant => C D
             * result => A B C D
             * Sum of both unique votes are within the max, so we can add the votes to the user
             */
            case $votesMinEnabled && $votesLimitEnabled && $targetContributorHasReachedVotesMin && !$targetContributorHasReachedVotesLimit && $participantHasReachedVoteMin && !$participantHasReachedVotesLimit:
                ['uniqueVotes' => $uniqueVotes, 'duplicateVotes' => $duplicateVotes] = $this->getUniqueAndDuplicateVotes($targetContributorVotes, $participantVotes);

                if ($budget) {
                    /*
                     * budget = 1000
                     * min = 2
                     * max = 4
                     * user => A(400) B(400)
                     * participant => C(300) D(100)
                     * result => A(400) B(400) = 800
                     */
                    $sumEstimation = array_reduce($uniqueVotes, fn ($acc, $vote) => $acc + $vote->getProposal()->getEstimation(), 0);

                    if ($sumEstimation > $budget) {
                        foreach ($participantVotes as $participantVote) {
                            $this->em->remove($participantVote);
                        }
                        $this->em->flush();

                        return;
                    }
                }

                /*
                 * votesRanking = true
                 * min = 2
                 * max = 4
                 * user => A(4pts) B(3pts)
                 * participant => C(4pts) D(3pts)
                 * result => A(4pts) B(3pts)
                 */
                if ($votesRanking) {
                    foreach ($participantVotes as $participantVote) {
                        $this->em->remove($participantVote);
                    }
                    $this->em->flush();

                    return;
                }

                /*
                 * min = 2
                 * max = 4
                 * user => A B C D
                 * participant => D E
                 * result => A B C D
                 */
                if (\count($uniqueVotes) > $votesLimit) {
                    foreach ($participantVotes as $participantVote) {
                        $this->em->remove($participantVote);
                    }
                    $this->em->flush();

                    return;
                }

                foreach ($duplicateVotes as $duplicateVote) {
                    $this->em->remove($duplicateVote);
                    $this->em->flush();
                }
                foreach ($uniqueVotes as $vote) {
                    $vote->setContributor($contributorTarget);
                }
                $this->em->flush();

                return;
            /*
             * max = 3
             * user => A B C
             * participant => D
             * result => A B C
             */
            case $targetContributorHasReachedVotesLimit:
                foreach ($participantVotes as $vote) {
                    $this->em->remove($vote);
                }

                return;
            /*
             * votesRanking = true
             * min = 2
             * max = 3
             * user => A(5pts)
             * participant => C(5pts) D(4pts)
             * result => C(5pts) D(4pts)
             */
            case !$targetContributorHasReachedVotesMin && $participantHasReachedVoteMin && $votesRanking:
                foreach ($participantVotes as $participantVote) {
                    $participantVote->setContributor($contributorTarget);
                }
                foreach ($targetContributorVotes as $targetContributorVote) {
                    $this->em->remove($targetContributorVote);
                }
                $this->em->flush();

                return;

            default:
                if ($budget) {
                    ['uniqueVotes' => $uniqueVotes] = $this->getUniqueAndDuplicateVotes($targetContributorVotes, $participantVotes);
                    $sumEstimation = array_reduce($uniqueVotes, fn ($acc, $vote) => $acc + $vote->getProposal()->getEstimation(), 0);

                    if ($sumEstimation > $budget) {
                        foreach ($participantVotes as $participantVote) {
                            $this->em->remove($participantVote);
                        }
                        $this->em->flush();

                        return;
                    }
                }

                $targetContributorVotesCount = \count($targetContributorVotes);
                foreach ($participantVotes as $vote) {
                    $proposalId = $vote->getProposal()->getId();
                    $isDuplicateVote = \in_array($proposalId, $targetContributorVotesProposals, true);
                    if ($isDuplicateVote) {
                        $targetContributorVote = $targetContributorVotesProposalsMap[$vote->getProposal()->getId()];

                        if ($votesRanking && null !== $targetContributorVote->getPosition()) {
                            $vote->setPosition($targetContributorVote->getPosition());
                        }

                        $this->em->remove($targetContributorVote);
                        $this->indexer->remove(AbstractVote::class, $targetContributorVote->getId());
                        $this->em->flush();
                    }

                    if ($votesRanking && !$isDuplicateVote) {
                        $vote->setPosition($targetContributorVotesCount);
                    }

                    $vote->setContributor($contributorTarget);
                }
                $this->indexer->finishBulk();
                $this->em->flush();
        }
    }

    /**
     * @param array< ProposalCollectVote|ProposalSelectionVote > $targetContributorVotes
     * @param array< ProposalCollectVote|ProposalSelectionVote > $participantVotes
     *
     * @return array{'uniqueVotes': array<ProposalSelectionVote | ProposalCollectVote>, 'duplicateVotes': array<ProposalSelectionVote | ProposalCollectVote>}
     */
    private function getUniqueAndDuplicateVotes(array $targetContributorVotes, array $participantVotes): array
    {
        $proposalIds = [];
        $uniqueVotes = [];
        $duplicateVotes = [];
        $allVotes = array_merge($participantVotes, $targetContributorVotes);

        foreach ($allVotes as $vote) {
            $proposalId = $vote->getProposal()->getId();
            if (!\in_array($proposalId, $proposalIds, true)) {
                $uniqueVotes[] = $vote;
                $proposalIds[] = $proposalId;
            } else {
                $duplicateVotes[] = $vote;
            }
        }

        return ['uniqueVotes' => $uniqueVotes, 'duplicateVotes' => $duplicateVotes];
    }
}
