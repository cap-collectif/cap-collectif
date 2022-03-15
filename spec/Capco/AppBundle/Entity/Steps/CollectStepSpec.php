<?php

namespace spec\Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;

class CollectStepSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(CollectStep::class);
    }

    function it_resolver_cant_display_ballot()
    {
        $viewer = '.anon';
        $this->setSecretBallot(true);
        $this->setPublishedVoteDate(new \DateTime('2050-03-01'));
        $this->canDisplayBallot()->shouldReturn(false);

        $this->canResolverDisplayBallot($viewer)->shouldReturn(false);
    }

    function it_resolver_can_display_ballot()
    {
        $viewer = '.anon';
        $this->setSecretBallot(true);
        $this->setPublishedVoteDate(new \DateTime('2020-03-01'));
        $this->canDisplayBallot()->shouldReturn(true);

        $this->canResolverDisplayBallot($viewer)->shouldReturn(true);
    }

    function it_can_display_ballot_for_admin(User $viewer)
    {
        $viewer->isAdmin()->willReturn(true);
        $this->setSecretBallot(true);
        $this->setPublishedVoteDate(new \DateTime('2050-03-01'));
        $this->canDisplayBallot()->shouldReturn(false);

        $this->canResolverDisplayBallot($viewer)->shouldReturn(true);
    }
}