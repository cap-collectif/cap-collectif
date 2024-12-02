<?php

namespace spec\Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Steps\OtherStep;
use PhpSpec\ObjectBehavior;

class OtherStepSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(OtherStep::class);
    }
}
