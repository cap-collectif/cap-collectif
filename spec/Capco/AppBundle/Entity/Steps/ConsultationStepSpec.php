<?php

namespace spec\Capco\AppBundle\Entity\Steps;

use PhpSpec\ObjectBehavior;

class ConsultationStepSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\Steps\ConsultationStep');
    }
}
