<?php

namespace spec\Capco\AppBundle\UrlResolver\Specifications;

use Capco\AppBundle\Entity\Event;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;


class HasSlugSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\UrlResolver\Specifications\HasSlug');
    }

    function it_should_detect_if_it_has_slug(Event $event)
    {
        $event->getSlug()->willReturn('test');
        $this->isSatisfiedBy($event)->shouldReturn(true);

        $event->getSlug()->willReturn(null);
        $this->isSatisfiedBy($event)->shouldReturn(false);
    }
}
