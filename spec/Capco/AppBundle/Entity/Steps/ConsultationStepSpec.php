<?php

namespace spec\Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class ConsultationStepSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\Steps\ConsultationStep');
    }
}
