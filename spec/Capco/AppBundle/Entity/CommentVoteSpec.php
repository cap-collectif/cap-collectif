<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Model\Publishable;
use PhpSpec\ObjectBehavior;

class CommentVoteSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(CommentVote::class);
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
