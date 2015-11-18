<?php

namespace spec\Capco\AppBundle\Entity\Steps;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class OtherStepSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\Steps\OtherStep');
    }
}
