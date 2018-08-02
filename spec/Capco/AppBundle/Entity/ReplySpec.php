<?php
namespace spec\Capco\AppBundle\Entity;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Model\Publishable;

class ReplySpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(Reply::class);
    }

    function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
