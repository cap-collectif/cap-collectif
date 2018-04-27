<?php

namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;

class IdeaSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\Idea');
    }

    function it_has_class_name()
    {
        $this->getClassName()->shouldReturn('Idea');
    }
}
