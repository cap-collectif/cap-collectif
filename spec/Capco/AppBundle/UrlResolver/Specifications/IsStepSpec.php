<?php

namespace spec\Capco\AppBundle\UrlResolver\Specifications;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\UrlResolver\Specifications\HasSlug;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;


class IsStepSpec extends ObjectBehavior
{
    function let(HasSlug $spec)
    {
        $this->beConstructedWith($spec);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\UrlResolver\Specifications\IsStep');
    }

    function it_should_detect_if_it_is_a_spec(AbstractStep $step, Event $event, $spec)
    {
        $step->getSlug()->willReturn('test');

        $spec->isSatisfiedBy($step)->shouldBeCalled()->willReturn(true);
        $this->isSatisfiedBy($step)->shouldReturn(true);

        $spec->isSatisfiedBy($step)->shouldBeCalled()->willReturn(true);
        $this->isSatisfiedBy($event)->shouldReturn(false);
    }
}
