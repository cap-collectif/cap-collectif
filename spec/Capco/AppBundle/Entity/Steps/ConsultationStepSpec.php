<?php

namespace spec\Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use PhpSpec\ObjectBehavior;

class ConsultationStepSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ConsultationStep::class);
    }
}
