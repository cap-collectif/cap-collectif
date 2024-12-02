<?php

namespace spec\Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Steps\PresentationStep;
use PhpSpec\ObjectBehavior;

class PresentationStepSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(PresentationStep::class);
    }
}
