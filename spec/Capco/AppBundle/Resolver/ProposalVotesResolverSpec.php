<?php

namespace spec\Capco\AppBundle\Resolver;

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
}
