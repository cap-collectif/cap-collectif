<?php

namespace spec\Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Helper\ProjectHelper;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Capco\AppBundle\Entity\Steps\AbstractStep;

class StepHelperSpec extends ObjectBehavior
{
    function it_is_initializable(ProjectHelper $projectHelper)
    {
        $this->beConstructedWith($projectHelper);
        $this->shouldHaveType('Capco\AppBundle\Helper\StepHelper');
    }

    function it_can_guess_opening_status(
        AbstractStep $step,
        CollectStep $collectStep,
        ProjectHelper $projectHelper,
        AbstractStep $stepA,
        AbstractStep $stepB
    )
    {
        $this->beConstructedWith($projectHelper);

        $step->isTimeless()->willReturn(false);
        $step->isParticipative()->willReturn(false);
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
        $projectHelper->getPreviousSteps($step)->willReturn([$stepA, $stepB]);
        $stepA->getStartAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $stepA->getEndAt()->willReturn(null);
        $this->getStatus($step)->shouldReturn('future');

        $stepA->getStartAt()->willReturn(null);
        $stepA->getEndAt()->willReturn(null);
        $stepB->getStartAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $stepB->getEndAt()->willReturn((new \DateTime())->modify('+1 weeks'));
        $this->getStatus($step)->shouldReturn('future');

        // if no previous steps
        $projectHelper->getPreviousSteps($step)->willReturn([]);
        $this->getStatus($step)->shouldReturn('closed');

        // if no previous steps has dates
        $projectHelper->getPreviousSteps($step)->willReturn([$stepA]);
        $stepA->getStartAt()->willReturn(null);
        $stepA->getEndAt()->willReturn(null);
        $this->getStatus($step)->shouldReturn('closed');

        // if previous steps have past dates
        $stepA->getStartAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $stepA->getEndAt()->willReturn((new \DateTime())->modify('-1 weeks'));
        $this->getStatus($step)->shouldReturn('closed');

        // if analyzed step is a timeless one.
        $collectStep->getStartAt()->willReturn(null);
        $collectStep->getEndAt()->willReturn(null);
        $collectStep->isTimeless()->willReturn(true);
        $collectStep->isParticipative()->willReturn(true);
        $this->getStatus($collectStep)->shouldReturn('open');
    }
}
