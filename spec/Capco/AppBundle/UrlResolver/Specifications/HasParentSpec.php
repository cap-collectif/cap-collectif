<?php

namespace spec\Capco\AppBundle\UrlResolver\Specifications;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\UrlResolver\Specifications\HasSlug;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;


class HasParentSpec extends ObjectBehavior
{
    function let(HasSlug $spec)
    {
        $this->beConstructedWith($spec);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\UrlResolver\Specifications\HasParent');
    }

    function it_should_detect_if_it_has_parent(Source $source, $spec)
    {
        $source->getSlug()->willReturn('test');
        $source->getParent()->willReturn('parent');

        $spec->isSatisfiedBy($source)->shouldBeCalled()->willReturn(true);
        $this->isSatisfiedBy($source)->shouldReturn(true);

        $spec->isSatisfiedBy($source)->shouldBeCalled()->willReturn(false);
        $this->isSatisfiedBy($source)->shouldReturn(false);

        $source->getParent()->willReturn(null);

        $spec->isSatisfiedBy($source)->shouldBeCalled()->willReturn(true);
        $this->isSatisfiedBy($source)->shouldReturn(false);
    }
}
