<?php

namespace spec\Capco\AppBundle\Resolver;

use Capco\AppBundle\Resolver\UrlResolver;
use PhpSpec\ObjectBehavior;

class StepResolverSpec extends ObjectBehavior
{
    public function let(UrlResolver $urlResolver)
    {
        $this->beConstructedWith($urlResolver);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Resolver\StepResolver');
    }
}
