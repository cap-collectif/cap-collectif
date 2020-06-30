<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\GraphQL\Resolver\Participant\IsViewerParticipatingAtEventResolver;

class IsViewerParticipatingAtEventResolverSpec extends ObjectBehavior
{
    public function let(EventRegistrationRepository $eventRegistrationRepository)
    {
        $this->beConstructedWith($eventRegistrationRepository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(IsViewerParticipatingAtEventResolver::class);
    }

    public function it_should_return_true_when_user_is_participating_at_event(
        EventRegistrationRepository $eventRegistrationRepository,
        EventRegistration $eventRegistration,
        Event $event,
        User $viewer
    ) {
        $eventRegistrationRepository
            ->getOneByUserAndEvent($viewer, $event)
            ->shouldBeCalled()
            ->willReturn($eventRegistration);
        $this->__invoke($event, $viewer)->shouldReturn(true);
    }

    public function it_should_return_false_when_user_doesnt_participate_at_event(
        EventRegistrationRepository $eventRegistrationRepository,
        Event $event,
        User $viewer
    ) {
        $eventRegistrationRepository
            ->getOneByUserAndEvent($viewer, $event)
            ->shouldBeCalled()
            ->willReturn(null);
        $this->__invoke($event, $viewer)->shouldReturn(false);
    }
}
