<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Event;
use PhpSpec\ObjectBehavior;

class EventRegistrationSpec extends ObjectBehavior
{
    public function it_is_initializable(Event $event)
    {
        $this->beConstructedWith($event);
        $this->shouldHaveType('Capco\AppBundle\Entity\EventRegistration');
    }
}
