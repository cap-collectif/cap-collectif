<?php

namespace spec\Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalVote;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Repository\ProposalVoteRepository;

class ProposalVotesResolverSpec extends ObjectBehavior
{
    function let(ProposalVoteRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Resolver\ProposalVotesResolver');
    }

    function it_can_say_if_proposal_has_vote(ProposalVote $vote1, ProposalVote $vote2, Proposal $proposal1, Proposal $proposal2)
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
}
