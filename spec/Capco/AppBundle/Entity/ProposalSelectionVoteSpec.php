<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Model\Publishable;
use PhpSpec\ObjectBehavior;

class ProposalSelectionVoteSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalSelectionVote::class);
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
