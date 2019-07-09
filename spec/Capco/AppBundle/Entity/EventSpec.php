<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Event;
use PhpSpec\ObjectBehavior;

class EventSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Event::class);
    }

    public function it_is_registration_enable()
    {
        $this->setLink('http://my-external-event-registration.link');
        $this->setGuestListEnabled(false);
        $this->isRegistrable()->shouldReturn(true);

        $this->setLink(null);
        $this->setGuestListEnabled(true);
        $this->isRegistrable()->shouldReturn(true);

        $this->setGuestListEnabled(false);
        $this->isRegistrable()->shouldReturn(false);
    }
}
