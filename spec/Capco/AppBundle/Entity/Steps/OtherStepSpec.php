<?php

namespace spec\Capco\AppBundle\Entity\Steps;

use PhpSpec\ObjectBehavior;

class OtherStepSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\Steps\OtherStep');
    }
}
