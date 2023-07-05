<?php

namespace spec\Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use PhpSpec\ObjectBehavior;

class StepHelperSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Helper\StepHelper');
    }

    public function it_returns_open_status(AbstractStep $step)
    {
        $now = new \DateTime();
        $step->isOpen($now)->willReturn(true);
        $step->isFuture($now)->willReturn(false);
        $step->isClosed($now)->willReturn(false);
        $this->getStatus($step, $now)->shouldReturn('open');
    }

    public function it_returns_future_status(AbstractStep $step)
    {
        $now = new \DateTime();
        $step->isOpen($now)->willReturn(false);
        $step->isFuture($now)->willReturn(true);
        $step->isClosed($now)->willReturn(false);
        $this->getStatus($step, $now)->shouldReturn('future');
    }

    public function it_returns_closed_status(AbstractStep $step)
    {
        $now = new \DateTime();
        $step->isOpen($now)->willReturn(false);
        $step->isFuture($now)->willReturn(false);
        $step->isClosed($now)->willReturn(true);
        $this->getStatus($step, $now)->shouldReturn('closed');
    }
}
