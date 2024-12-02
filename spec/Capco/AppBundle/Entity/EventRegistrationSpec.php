<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventRegistration;
use PhpSpec\ObjectBehavior;

class EventRegistrationSpec extends ObjectBehavior
{
    public function it_is_initializable(Event $event)
    {
        $this->beConstructedWith($event);
        $this->shouldHaveType(EventRegistration::class);
    }
}
