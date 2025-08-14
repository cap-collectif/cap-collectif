<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ProposalVoteAccountHandler
{
    public function __construct(
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver,
        private readonly EntityManagerInterface $em,
        private readonly Indexer $indexer
    ) {
    }

    //Use this method after validation but before effective creation or deletion
    public function checkIfUserVotesAreStillAccounted(
        AbstractStep $step,
        AbstractVote $vote,
        User $user,
        bool $isAddingVote
    ): bool {
        $isAccounted = true;
        $isSelectionStep = $step instanceof SelectionStep;

        if ($isSelectionStep || $step instanceof CollectStep) {
            $votesMin = $step->getVotesMin();
            if (null === $votesMin) {
                $vote->setIsAccounted(true);

                return true;
            }
            //Check if user has voted at least VotesMin times
            $userVotes = $this->getUserVotesFromSpecificClass($step, $user);
            //-1 or +1 corresponds to the vote being removed or added
            $isAccounted = $votesMin <= \count($userVotes) + ($isAddingVote ? 1 : -1);
            foreach ($userVotes as $userVote) {
                $userVote->setIsAccounted($isAccounted);
//                $this->indexer->index(Proposal::class, $userVote->getProposal()->getId());
                $this->indexer->index(AbstractVote::class, $userVote->getId());
            }
            $vote->setIsAccounted($isAccounted);
            $this->indexer->finishBulk();
        }

        return $isAccounted;
    }

    public function checkIfParticipantVotesAreStillAccounted(
        ProposalStepInterface $step,
        AbstractVote $vote,
        Participant $participant,
        bool $isAddingVote
    ): void {
        $min = $step->getVotesMin();

        if (null === $min) {
            $vote->setIsAccounted(true);

            return;
        }

        $existingVotes = $this->getParticipantVotesFromSpecificClass($step, $participant);
        $isAccounted = $min <= \count($existingVotes) + ($isAddingVote ? 1 : -1);

        foreach ($existingVotes as $existingVote) {
            $existingVote->setIsAccounted($isAccounted);
            $this->indexer->index(AbstractVote::class, $existingVote->getId());
        }

        $vote->setIsAccounted($isAccounted);
    }

    public function checkIfMediatorParticipantVotesAreStillAccounted(
        SelectionStep $step,
        Mediator $mediator,
        Participant $participant,
        User $viewer
    ): bool {
        $isMeetingRequirements = $this->participantIsMeetingRequirementsResolver->__invoke(
            $participant,
            new Argument(['stepId' => GlobalId::toGlobalId('AbstractStep', $step->getId())]),
            $viewer
        );

        $minimumVote = $step->getVotesMin() ?? 0;

        $proposalSelectionVoteCount = $this->proposalSelectionVoteRepository->count([
            'mediator' => $mediator,
            'participant' => $participant,
        ]);

        $isAccounted = ($minimumVote <= $proposalSelectionVoteCount) && $isMeetingRequirements;

        /** @var array<ProposalSelectionVote> $proposalSelectionVotes */
        $proposalSelectionVotes = $this->proposalSelectionVoteRepository->findBy([
            'mediator' => $mediator,
            'participant' => $participant,
        ]);

        foreach ($proposalSelectionVotes as $proposalSelectionVote) {
            $proposalSelectionVote->setIsAccounted($isAccounted);
        }

        $this->em->flush();

        return $isAccounted;
    }

    /**
     * @return Paginator<ProposalCollectVote|ProposalSelectionVote>
     */
    private function getUserVotesFromSpecificClass(AbstractStep $step, User $user): Paginator
    {
        if ($step instanceof SelectionStep) {
            return $this->proposalSelectionVoteRepository->getByAuthorAndStep($user, $step);
        }
        if ($step instanceof CollectStep) {
            return $this->proposalCollectVoteRepository->getByAuthorAndStep($user, $step);
        }
        $class = $step::class;

        throw new \RuntimeException("AbstractStep type {$class} not handled in getVotesFromSpecificClass");
    }

    /**
     * @return array<ProposalCollectVote|ProposalSelectionVote>
     */
    private function getParticipantVotesFromSpecificClass(ProposalStepInterface $step, Participant $participant): array
    {
        if ($step instanceof SelectionStep) {
            return $this->proposalSelectionVoteRepository->getVotesByStepAndContributor($step, $participant);
        }
        if ($step instanceof CollectStep) {
            return $this->proposalCollectVoteRepository->getVotesByStepAndContributor($step, $participant);
        }

        return [];
    }
}
