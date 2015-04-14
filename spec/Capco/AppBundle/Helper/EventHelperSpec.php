<?php

namespace spec\Capco\AppBundle\Helper;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Doctrine\Common\Collections\ArrayCollection;

use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\EventRegistration;

class EventHelperSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Helper\EventHelper');
    }

    function it_knows_when_event_registration_are_possible(Event $event)
    {
        $event->getLink()->willReturn(null);
        $event->isRegistrationEnable()->willReturn(false);
        $event->getEndAt()->willReturn((new \DateTime())->modify('+ 1 day'));
        $event->canContribute()->willReturn(true);
        $this->isRegistrationPossible($event)->shouldReturn(false);

        $event->getLink()->willReturn(null);
        $event->isRegistrationEnable()->willReturn(false);
        $event->getEndAt()->willReturn((new \DateTime())->modify('- 1 day'));
        $event->canContribute()->willReturn(true);
        $this->isRegistrationPossible($event)->shouldReturn(false);

        $event->getLink()->willReturn(null);
        $event->isRegistrationEnable()->willReturn(true);
        $event->getEndAt()->willReturn((new \DateTime())->modify('+ 1 day'));
        $event->canContribute()->willReturn(true);
        $this->isRegistrationPossible($event)->shouldReturn(true);

        $event->getLink()->willReturn(null);
        $event->isRegistrationEnable()->willReturn(true);
        $event->getEndAt()->willReturn((new \DateTime())->modify('+ 1 day'));
        $event->canContribute()->willReturn(false);
        $this->isRegistrationPossible($event)->shouldReturn(false);

        $event->isRegistrationEnable()->willReturn(true);
        $event->getEndAt()->willReturn((new \DateTime())->modify('+ 1 day'));
        $event->getLink()->willReturn('http://lol.com');
        $event->canContribute()->willReturn(true);
        $this->isRegistrationPossible($event)->shouldReturn(false);

        $event->getLink()->willReturn(null);
        $event->isRegistrationEnable()->willReturn(true);
        $event->getEndAt()->willReturn((new \DateTime())->modify('- 1 day'));
        $event->canContribute()->willReturn(true);
        $this->isRegistrationPossible($event)->shouldReturn(false);
    }

    function it_can_find_user_registration(Event $event, User $user)
    {
        $event->getRegistrations()->willReturn(new ArrayCollection());
        $this->findUserRegistrationOrCreate($event, $user)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\EventRegistration');
    }
}
