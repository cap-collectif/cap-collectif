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


    function it_can_find_availabled_types_for_link(OpinionType $parent, OpinionType $a, OpinionType $b, ConsultationStepType $consultationType)
    {
        $availableTypes = [$a, $b];
        $parent->getChildren(true)->willReturn($availableTypes);
        $this->setParent($parent);
        $this->getAvailableOpinionTypesToCreateLink()->shouldReturn($availableTypes);

        $this->setParent(null);
        $this->setConsultationStepType($consultationType);
        $consultationType->getOpinionTypes()->willReturn($availableTypes);
        $this->getAvailableOpinionTypesToCreateLink()->shouldReturn($availableTypes);
    }
}
