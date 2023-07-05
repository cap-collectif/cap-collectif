<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Model\Publishable;
use PhpSpec\ObjectBehavior;

class ProposalCommentSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalComment::class);
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }

    public function it_is_a_trashable()
    {
        $this->shouldImplement(Trashable::class);
    }
}
