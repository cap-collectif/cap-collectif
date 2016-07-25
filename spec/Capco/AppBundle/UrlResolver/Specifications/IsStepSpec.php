<?php

namespace spec\Capco\AppBundle\UrlResolver\Specifications;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;


class IsStepSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\UrlResolver\Specifications\IsStep');
    }

    function it_should_detect_if_it_is_a_step(AbstractStep $step, Event $event)
    {
        $this->isSatisfiedBy($step)->shouldReturn(true);
        $this->isSatisfiedBy($event)->shouldReturn(false);
    }
}
