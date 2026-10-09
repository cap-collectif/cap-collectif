<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Event;
use PhpSpec\ObjectBehavior;

class EventSpec extends ObjectBehavior
{
    private const NOW = '2026-10-08 12:00:00';

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
        $now = new \DateTime(self::NOW);
        $start = new \DateTime('2026-10-08 11:00:00');
        $end = new \DateTime('2026-10-10 11:30:00');
        $this->setStartAt($start);
        $this->setEndAt($end);
        $this->hasStarted($now)->shouldReturn(true);
        $this->hasEnded($now)->shouldReturn(false);
        $this->lastOneDay()->shouldReturn(false);
        $this->isOpen($now)->shouldReturn(true);
        $this->isClosed($now)->shouldReturn(false);
        $this->isFuture($now)->shouldReturn(false);
        $this->getRemainingTime($now)->shouldBeLike(['days' => 1, 'hours' => 23]);
    }

    public function it_event_not_started_yet()
    {
        $now = new \DateTime(self::NOW);
        $start = new \DateTime('2026-10-10 12:00:00');
        $end = new \DateTime('2026-10-11 12:00:00');
        $this->setStartAt($start);
        $this->setEndAt($end);
        $this->hasStarted($now)->shouldReturn(false);
        $this->hasEnded($now)->shouldReturn(false);
        $this->lastOneDay()->shouldReturn(false);
        $this->isOpen($now)->shouldReturn(false);
        $this->isClosed($now)->shouldReturn(false);
        $this->isFuture($now)->shouldReturn(true);
        $this->getRemainingTime($now)->shouldBeLike(null);
    }

    public function it_event_closed()
    {
        $now = new \DateTime(self::NOW);
        $start = new \DateTime('2026-10-05 12:00:00');
        $end = new \DateTime('2026-10-07 12:00:00');
        $this->setStartAt($start);
        $this->setEndAt($end);
        $this->hasStarted($now)->shouldReturn(true);
        $this->hasEnded($now)->shouldReturn(true);
        $this->lastOneDay()->shouldReturn(false);
        $this->isOpen($now)->shouldReturn(false);
        $this->isClosed($now)->shouldReturn(true);
        $this->isFuture($now)->shouldReturn(false);
        $this->getRemainingTime($now)->shouldBeLike(null);
    }

    public function it_event_last_one_day()
    {
        $now = new \DateTime(self::NOW);
        $start = new \DateTime('2026-10-08 12:00:00');
        $end = new \DateTime('2026-10-08 13:10:00');
        $this->setStartAt($start);
        $this->setEndAt($end);

        $this->getStartAt()->shouldBeLike($start);
        $this->getEndAt()->shouldBeLike($end);
        $this->hasStarted($now)->shouldReturn(true);
        $this->hasEnded($now)->shouldReturn(false);
        $this->lastOneDay()->shouldReturn(true);
        $this->isOpen($now)->shouldReturn(true);
        $this->isClosed($now)->shouldReturn(false);
        $this->isFuture($now)->shouldReturn(false);
        $this->getRemainingTime($now)->shouldBeLike(['days' => 0, 'hours' => 1]);
    }

    public function it_event_occurs_in_future()
    {
        $now = new \DateTime(self::NOW);
        $start = new \DateTime('2026-10-09 12:00:00');
        $end = new \DateTime('2026-10-12 12:00:00');
        $this->setStartAt($start);
        $this->setEndAt($end);

        $this->getStartAt()->shouldBeLike($start);
        $this->getEndAt()->shouldBeLike($end);
        $this->hasStarted($now)->shouldReturn(false);
        $this->hasEnded($now)->shouldReturn(false);
        $this->lastOneDay()->shouldReturn(false);
        $this->isOpen($now)->shouldReturn(false);
        $this->isClosed($now)->shouldReturn(false);
        $this->isFuture($now)->shouldReturn(true);
        $this->getRemainingTime($now)->shouldBeLike(null);
    }
}
