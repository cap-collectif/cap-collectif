<?php

namespace spec\Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Repository\ProposalVoteRepository;

class ProposalVotesResolverSpec extends ObjectBehavior
{
    function let(ProposalVoteRepository $proposalVoteRepository, SelectionStepRepository $selectionStepRepository)
    {
        $this->beConstructedWith($proposalVoteRepository, $selectionStepRepository);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Resolver\ProposalVotesResolver');
    }

    function it_can_tell_if_proposal_has_vote(ProposalVote $vote1, ProposalVote $vote2, Proposal $proposal1, Proposal $proposal2)
    {
        $arrayProposal1 = [
            'id' => 1,
        ];
        $arrayProposal2 = [
            'id' => 2,
        ];
        $proposal1->getId()->willReturn(1);
        $proposal2->getId()->willReturn(2);
        $vote1->getProposal()->willReturn($proposal1);
        $vote2->getProposal()->willReturn($proposal1);
        $usersVotesForSelectionStep = [$vote1, $vote2];

        $this->proposalHasVote($arrayProposal1, $usersVotesForSelectionStep)->shouldReturn(true);
        $this->proposalHasVote($arrayProposal2, $usersVotesForSelectionStep)->shouldReturn(false);
    }

    function it_can_tell_if_vote_is_possible(ProposalVoteRepository $proposalVoteRepository, SelectionStepRepository $selectionStepRepository, SelectionStep $selectionStep1, SelectionStep $selectionStep2, User $user1, Proposal $proposal, ProposalVote $otherVote1, ProposalVote $otherVote2, Project $project1, Project $project2, Proposal $proposal1, Proposal $proposal2, ProposalVote $vote1, ProposalVote $vote2, ProposalVote $vote3)
    {
        $proposal1->getEstimation()->willReturn(50);
        $proposal2->getEstimation()->willReturn(80);
        $otherVote1->getProposal()->willReturn($proposal1);
        $otherVote2->getProposal()->willReturn($proposal2);
        $proposalVoteRepository->findBy([
            'selectionStep' => $selectionStep1,
            'user' => $user1,
        ])->willReturn([]);
        $proposalVoteRepository->findBy([
            'selectionStep' => $selectionStep2,
            'user' => $user1,
        ])->willReturn([$otherVote1]);
        $proposalVoteRepository->findBy([
            'selectionStep' => $selectionStep2,
            'email' => 'email@test.com',
        ])->willReturn([$otherVote2]);
        $this->beConstructedWith($proposalVoteRepository, $selectionStepRepository);

        $selectionStep1->getBudget()->willReturn(null);
        $selectionStep1->isVotable()->willReturn(true);
        $selectionStep1->isBudgetVotable()->willReturn(true);
        $selectionStep2->getBudget()->willReturn(100);
        $selectionStep2->isVotable()->willReturn(true);
        $selectionStep2->isBudgetVotable()->willReturn(true);

        $proposal->getEstimation()->willReturn(30);

        // No budget defined
        $vote1->getProposal()->willReturn($proposal);
        $vote1->getUser()->willReturn($user1);
        $vote1->getSelectionStep()->willReturn($selectionStep1);
        $this->getAmountSpentForVotes([])->shouldReturn(0);
        $this->voteIsPossible($vote1)->shouldReturn(true);

        // Enough money left
        $vote2->getProposal()->willReturn($proposal);
        $vote2->getUser()->willReturn($user1);
        $vote2->getSelectionStep()->willReturn($selectionStep2);
        $this->getAmountSpentForVotes([$otherVote1])->shouldReturn(50);
        $this->voteIsPossible($vote2)->shouldReturn(true);

        // Not enough money left
        $vote3->getProposal()->willReturn($proposal);
        $vote3->getUser()->willReturn(null);
        $vote3->getEmail()->willReturn('email@test.com');
        $vote3->getSelectionStep()->willReturn($selectionStep2);
        $this->getAmountSpentForVotes([$otherVote2])->shouldReturn(80);
        $this->voteIsPossible($vote3)->shouldReturn(false);
    }

    function it_can_tell_which_amount_has_been_spent_on_votes(ProposalVote $vote1, ProposalVote $vote2, Proposal $proposal1, Proposal $proposal2)
    {
        $proposal1->getEstimation()->willReturn(20);
        $proposal2->getEstimation()->willReturn(50);
        $vote1->getProposal()->willReturn($proposal1);
        $vote2->getProposal()->willReturn($proposal2);

        $this->getAmountSpentForVotes([$vote1])->shouldReturn(20);
        $this->getAmountSpentForVotes([$vote2])->shouldReturn(50);
        $this->getAmountSpentForVotes([$vote1, $vote2])->shouldReturn(70);
    }
}
