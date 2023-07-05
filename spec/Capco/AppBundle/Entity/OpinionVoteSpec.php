<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Model\Publishable;
use PhpSpec\ObjectBehavior;

class OpinionVoteSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\OpinionVote');
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
