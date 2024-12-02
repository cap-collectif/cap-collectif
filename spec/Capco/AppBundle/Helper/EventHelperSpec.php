<?php

namespace spec\Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\Helper\EventHelper;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;

class EventHelperSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(EventHelper::class);
    }

    public function it_knows_when_event_registration_are_possible(Event $event)
    {
        // Registration is disable => false
        $event->getLink()->willReturn(null);
        $event->isGuestListEnabled()->willReturn(false);
        $event->isFuture()->willReturn(true);
        $event->canContribute()->willReturn(true);
        $event->isRegistrationComplete()->willReturn(false);
        $this->isRegistrationPossible($event)->shouldReturn(false);
        $this->isCompleteAndRegistrationPossibleResolver($event)->shouldReturn(false);

        // Event is not future => false
        $event->getLink()->willReturn(null);
        $event->isGuestListEnabled()->willReturn(true);
        $event->isFuture()->willReturn(false);
        $event->canContribute()->willReturn(true);
        $event->isRegistrationComplete()->willReturn(false);
        $this->isRegistrationPossible($event)->shouldReturn(false);
        $this->isCompleteAndRegistrationPossibleResolver($event)->shouldReturn(false);
        // Can not contribute => false
        $event->getLink()->willReturn(null);
        $event->isGuestListEnabled()->willReturn(true);
        $event->isFuture()->willReturn(true);
        $event->canContribute()->willReturn(false);
        $event->isRegistrationComplete()->willReturn(false);
        $this->isRegistrationPossible($event)->shouldReturn(false);
        $this->isCompleteAndRegistrationPossibleResolver($event)->shouldReturn(false);
        // Has link => false
        $event->isGuestListEnabled()->willReturn(true);
        $event->isFuture()->willReturn(true);
        $event->getLink()->willReturn('http://lol.com');
        $event->canContribute()->willReturn(true);
        $event->isRegistrationComplete()->willReturn(false);
        $this->isRegistrationPossible($event)->shouldReturn(false);
        $this->isCompleteAndRegistrationPossibleResolver($event)->shouldReturn(false);
        // Everything is awesome => true
        $event->getLink()->willReturn(null);
        $event->isGuestListEnabled()->willReturn(true);
        $event->isFuture()->willReturn(true);
        $event->canContribute()->willReturn(true);
        $event->isRegistrationComplete()->willReturn(true);
        $this->isRegistrationPossible($event)->shouldReturn(true);
        $this->isCompleteAndRegistrationPossibleResolver($event)->shouldReturn(true);
        // Everything is awesome => true
        $event->getLink()->willReturn(null);
        $event->isGuestListEnabled()->willReturn(true);
        $event->isFuture()->willReturn(true);
        $event->canContribute()->willReturn(true);
        $event->isRegistrationComplete()->willReturn(true);
        $this->isRegistrationPossible($event)->shouldReturn(true);
        $this->isCompleteAndRegistrationPossibleResolver($event)->shouldReturn(true);
    }

    public function it_can_find_user_registration(Event $event, User $user)
    {
        $event->getRegistrations()->willReturn(new ArrayCollection());
        $this->findUserRegistrationOrCreate($event, $user)->shouldReturnAnInstanceOf(
            EventRegistration::class
        );
    }
}
