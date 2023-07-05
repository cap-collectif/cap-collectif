<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Model\Publishable;
use PhpSpec\ObjectBehavior;

class ProposalCollectVoteSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalCollectVote::class);
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
