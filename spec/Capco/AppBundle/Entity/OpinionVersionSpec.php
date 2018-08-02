<?php
namespace spec\Capco\AppBundle\Entity;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Entity\OpinionVersion;

class OpinionVersionSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(OpinionVersion::class);
    }

    function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
