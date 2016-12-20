<?php

namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Steps\ConsultationStepType;

class OpinionTypeSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\OpinionType');
    }
}
