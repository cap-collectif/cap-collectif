<?php

namespace spec\Capco\AppBundle\Helper;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Helper\ProjectHelper;

class StepHelperSpec extends ObjectBehavior
{
    function it_is_initializable(ProjectHelper $helper)
    {
        $this->beConstructedWith($helper);
        $this->shouldHaveType('Capco\AppBundle\Helper\StepHelper');
    }

    function it_can_guess_opening_status(ProjectHelper $helper, AbstractStep $step, AbstractStep $stepA, AbstractStep $stepB)
    {
        $this->beConstructedWith($helper);

        /* Case 1: step has start and end dates */

        // if start date is future
        $step->getStartAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $step->getEndAt()->willReturn((new \DateTime())->modify('+2 weeks'));
        $this->getStatus($step)->shouldReturn('future');

        // if start date is before and end date future
        $step->getStartAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $step->getEndAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $this->getStatus($step)->shouldReturn('open');

        // if end date is past
        $step->getStartAt()->willReturn((new \DateTime())->modify('-2 weeks'));
        $step->getEndAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $this->getStatus($step)->shouldReturn('closed');

        /* Case 2: step has ony start date */

        // if start date is future
        $step->getStartAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $step->getEndAt()->willReturn(null);
        $this->getStatus($step)->shouldReturn('future');

        // if start date is past
        $step->getStartAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $step->getEndAt()->willReturn(null);
        $this->getStatus($step)->shouldReturn('closed');

        /* Case 3: no dates */
        $step->getStartAt()->willReturn(null);
        $step->getEndAt()->willReturn(null);

        // if at least one previous step has future dates
        $helper->getPreviousSteps($step)->willReturn([$stepA, $stepB]);
        $stepA->getStartAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $stepA->getEndAt()->willReturn(null);
        $this->getStatus($step)->shouldReturn('future');

        // $helper->getPreviousSteps($step)->willReturn([$stepA, $stepB]);
        $stepA->getStartAt()->willReturn(null);
        $stepA->getEndAt()->willReturn(null);
        $stepB->getStartAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $stepB->getEndAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $this->getStatus($step)->shouldReturn('future');

        // if no previous steps
        $helper->getPreviousSteps($step)->willReturn([]);
        $this->getStatus($step)->shouldReturn('closed');

        // if no previous steps has dates
        $helper->getPreviousSteps($step)->willReturn([$stepA]);
        $stepA->getStartAt()->willReturn(null);
        $stepA->getEndAt()->willReturn(null);
        $this->getStatus($step)->shouldReturn('closed');

        // if previous steps have past dates
        $stepA->getStartAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $stepA->getEndAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $this->getStatus($step)->shouldReturn('closed');
    }
}
