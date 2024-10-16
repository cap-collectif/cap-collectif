<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;

class ProposalVoteAccountHandler
{
    private ProposalCollectVoteRepository $proposalCollectVoteRepository;
    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;
    private ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver;
    private EntityManagerInterface $em;
    private ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository;

    public function __construct(
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver,
        ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository,
        EntityManagerInterface $em
    ) {
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->participantIsMeetingRequirementsResolver = $participantIsMeetingRequirementsResolver;
        $this->em = $em;
        $this->proposalSelectionSmsVoteRepository = $proposalSelectionSmsVoteRepository;
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
            //Check if user has voted at least VotesMin times
            if (($min = $step->getVotesMin()) !== null) {
                $userVotes = $this->getVotesFromSpecificClass($step, $user);
                //-1 or +1 corresponds to the vote being removed or added
                $isAccounted = $min <= \count($userVotes) + ($isAddingVote ? 1 : -1);
                foreach ($userVotes as $userVote) {
                    $userVote->setIsAccounted($isAccounted);
                }
                $vote->setIsAccounted($isAccounted);
            }
        }

        return $isAccounted;
    }

    //Use this method after validation but before effective creation or deletion
    public function checkIfAnonVotesAreStillAccounted(
        SelectionStep $step,
        AbstractVote $vote,
        string $phone,
        bool $isAddingVote
    ): bool {
        $isAccounted = true;
        $min = $step->getVotesMin();
        if (null !== $min) {
            $anonVotes = $this->proposalSelectionSmsVoteRepository->findBy(['selectionStep' => $step, 'phone' => $phone]);
            //-1 or +1 corresponds to the vote being removed or added
            $isAccounted = $min <= \count($anonVotes) + ($isAddingVote ? 1 : -1);
            foreach ($anonVotes as $anonVote) {
                $anonVote->setIsAccounted($isAccounted);
            }
            $vote->setIsAccounted($isAccounted);
        }

        return $isAccounted;
    }

    public function checkIfMediatorParticipantVotesAreStillAccounted(
        SelectionStep $step,
        Mediator $mediator,
        Participant $participant,
        User $viewer
    ): bool {
        $isMeetingRequirements = $this->participantIsMeetingRequirementsResolver->__invoke(
            $participant,
            new Argument(['stepId' => $step->getId()]),
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

    private function getVotesFromSpecificClass(AbstractStep $step, User $user): ?Paginator
    {
        if ($step instanceof SelectionStep) {
            return $this->proposalSelectionVoteRepository->getByAuthorAndStep($user, $step);
        }
        if ($step instanceof CollectStep) {
            return $this->proposalCollectVoteRepository->getByAuthorAndStep($user, $step);
        }
        $class = \get_class($step);

        throw new \RuntimeException("AbstractStep type {$class} not handled in getVotesFromSpecificClass");
    }
}
