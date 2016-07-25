<?php

namespace spec\Capco\AppBundle\UrlResolver\Specifications;

use Capco\AppBundle\Entity\Source;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;


class HasParentSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\UrlResolver\Specifications\HasParent');
    }

    function it_should_detect_if_it_has_parent(Source $source, $spec)
    {
        $source->getParent()->willReturn('parent');

        $this->isSatisfiedBy($source)->shouldReturn(true);

        $source->getParent()->willReturn(null);

        $this->isSatisfiedBy($source)->shouldReturn(false);
    }
}
