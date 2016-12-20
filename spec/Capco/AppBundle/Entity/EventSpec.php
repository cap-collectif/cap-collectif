<?php

namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class EventSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\Event');
    }

    function it_has_class_name()
    {
        $this->getClassName()->shouldReturn('Event');
    }
}
