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

    public function it_event_ongoing()
    {
        $start = new \DateTime('now');
        $end = new \DateTime('now + 2 days');
        $this->setStartAt($start);
        $this->setEndAt($end);
        $this->hasStarted()->shouldReturn(true);
        $this->hasEnded()->shouldReturn(false);
        $this->lastOneDay()->shouldReturn(false);
        $this->isOpen()->shouldReturn(true);
        $this->isClosed()->shouldReturn(false);
        $this->isFuture()->shouldReturn(false);
        $this->getRemainingTime()->shouldBeLike(['days' => 1, 'hours' => 23]);
    }

    public function it_event_not_started_yet()
    {
        $start = new \DateTime('now + 2 days');
        $end = new \DateTime('now + 3 days');
        $this->setStartAt($start);
        $this->setEndAt($end);
        $this->hasStarted()->shouldReturn(false);
        $this->hasEnded()->shouldReturn(false);
        $this->lastOneDay()->shouldReturn(false);
        $this->isOpen()->shouldReturn(false);
        $this->isClosed()->shouldReturn(false);
        $this->isFuture()->shouldReturn(true);
        $this->getRemainingTime()->shouldBeLike(null);
    }

    public function it_event_closed()
    {
        $start = new \DateTime('now -3 days');
        $end = new \DateTime('now -1 days');
        $this->setStartAt($start);
        $this->setEndAt($end);
        $this->hasStarted()->shouldReturn(true);
        $this->hasEnded()->shouldReturn(true);
        $this->lastOneDay()->shouldReturn(false);
        $this->isOpen()->shouldReturn(false);
        $this->isClosed()->shouldReturn(true);
        $this->isFuture()->shouldReturn(false);
        $this->getRemainingTime()->shouldBeLike(null);
    }

    public function it_event_last_one_day()
    {
        $start = new \DateTime('now');
        $end = new \DateTime('now + 1 hour + 10 minutes');
        $this->setStartAt($start);
        $this->setEndAt($end);

        $this->getStartAt()->shouldBeLike($start);
        $this->getEndAt()->shouldBeLike($end);
        $this->hasStarted()->shouldReturn(true);
        $this->hasEnded()->shouldReturn(false);
        $this->lastOneDay()->shouldReturn(true);
        $this->isOpen()->shouldReturn(true);
        $this->isClosed()->shouldReturn(false);
        $this->isFuture()->shouldReturn(false);
        $this->getRemainingTime()->shouldBeLike(['days' => 0, 'hours' => 1]);
    }

    public function it_event_occurs_in_future()
    {
        $start = new \DateTime('now + 1 day');
        $end = new \DateTime('now + 4 days');
        $this->setStartAt($start);
        $this->setEndAt($end);

        $this->getStartAt()->shouldBeLike($start);
        $this->getEndAt()->shouldBeLike($end);
        $this->hasStarted()->shouldReturn(false);
        $this->hasEnded()->shouldReturn(false);
        $this->lastOneDay()->shouldReturn(false);
        $this->isOpen()->shouldReturn(false);
        $this->isClosed()->shouldReturn(false);
        $this->isFuture()->shouldReturn(true);
        $this->getRemainingTime()->shouldBeLike(null);
    }
}
