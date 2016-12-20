<?php

namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Event;

class EventRegistrationSpec extends ObjectBehavior
{
    function it_is_initializable(Event $event)
    {
        $this->beConstructedWith($event);
        $this->shouldHaveType('Capco\AppBundle\Entity\EventRegistration');
    }
}
