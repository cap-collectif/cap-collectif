<?php

namespace spec\Capco\AppBundle\Helper;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Capco\AppBundle\Entity\Steps\AbstractStep;

class StepHelperSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Helper\StepHelper');
    }

    function it_can_guess_opening_status(AbstractStep $step)
    {
        // if start date is future
        $step->getStartAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $step->getEndAt()->willReturn((new \DateTime())->modify('+2 weeks'));
        $this->getStatus($step)->shouldReturn('future');

        // if start date is past and end date future
        $step->getStartAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $step->getEndAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $this->getStatus($step)->shouldReturn('open');

        // if start date and end date is past
        $step->getStartAt()->willReturn((new \DateTime())->modify('-2 weeks'));
        $step->getEndAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $this->getStatus($step)->shouldReturn('closed');

        // if start date is future and end date is null
        $step->getStartAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $step->getEndAt()->willReturn(null);
        $this->getStatus($step)->shouldReturn('future');

        // if start date is past and end date is null
        $step->getStartAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $step->getEndAt()->willReturn(null);
        $this->getStatus($step)->shouldReturn('open');

        // if start date and end date is null
        $step->getStartAt()->willReturn(null);
        $step->getEndAt()->willReturn(null);
        $this->getStatus($step)->shouldReturn('open');

        // if start date is null and end date is future
        $step->getStartAt()->willReturn(null);
        $step->getEndAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $this->getStatus($step)->shouldReturn('open');

        // if start date is null and end date is past
        $step->getStartAt()->willReturn(null);
        $step->getEndAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $this->getStatus($step)->shouldReturn('closed');
    }
}
