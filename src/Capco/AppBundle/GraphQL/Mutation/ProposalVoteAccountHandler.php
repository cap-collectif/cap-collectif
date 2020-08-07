<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProposalVoteAccountHandler
{
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;

    public function __construct(
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository
    )
    {
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
    }

    private function getVotesFromSpecificClass(AbstractStep $step, User $user): ?Paginator
    {
        if ($step instanceof SelectionStep){
            return $this->proposalSelectionVoteRepository->getByAuthorAndStep(
                $user,
                $step
            );
        }
        if ($step instanceof CollectStep){
            return $this->proposalCollectVoteRepository->getByAuthorAndStep(
                $user,
                $step
            );
        }
        $class = get_class($step);
        throw new \RuntimeException("AbstractStep type $class not handled in getVotesFromSpecificClass");
    }

    //Use this method after validation but before effective creation or deletion
    public function checkIfUserVotesAreStillAccounted(AbstractStep $step, AbstractVote $vote, User $user, bool $isAddingVote): bool {
        $isAccounted = true;
        $isSelectionStep = $step instanceof SelectionStep;
        if ($isSelectionStep || $step instanceof CollectStep) {
            //Check if user has voted at least VotesMin times
            if (($min = $step->getVotesMin()) !== null) {
                $userVotes = $this->getVotesFromSpecificClass($step, $user);
                //-1 or +1 corresponds to the vote being removed or added
                $isAccounted = $min <= count($userVotes) + ($isAddingVote ? 1 : -1);
                foreach ($userVotes as $userVote) {
                    $userVote->setIsAccounted($isAccounted);
                }
                $vote->setIsAccounted($isAccounted);
            }
        }
        return $isAccounted;
    }
}
