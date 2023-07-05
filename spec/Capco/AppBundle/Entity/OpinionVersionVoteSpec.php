<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Model\Publishable;
use PhpSpec\ObjectBehavior;

class OpinionVersionVoteSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(OpinionVersionVote::class);
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
