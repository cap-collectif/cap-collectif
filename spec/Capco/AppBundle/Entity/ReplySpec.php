<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Model\Publishable;
use PhpSpec\ObjectBehavior;

class ReplySpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Reply::class);
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
