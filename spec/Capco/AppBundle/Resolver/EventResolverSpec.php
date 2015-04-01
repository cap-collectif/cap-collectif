<?php

namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Capco\AppBundle\Repository\EventRepository;

class EventResolverSpec extends ObjectBehavior
{

    function let(EventRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Resolver\EventResolver');
    }
}
