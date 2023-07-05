<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateViewerHasArgumentResolver;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserWarning;
use PhpSpec\ObjectBehavior;

class DebateViewerHasArgumentResolverSpec extends ObjectBehavior
{
    public function let(DebateArgumentRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateViewerHasArgumentResolver::class);
    }

    public function it_resolve_true_when_voted(
        DebateArgumentRepository $repository,
        Debate $debate,
        User $viewer
    ) {
        $repository
            ->countByDebateAndUser($debate, $viewer)
            ->willReturn(1)
            ->shouldBeCalled()
        ;

        $this->__invoke($debate, $viewer)->shouldReturn(true);
    }

    public function it_resolve_false_when_not_voted(
        DebateArgumentRepository $repository,
        Debate $debate,
        User $viewer
    ) {
        $repository
            ->countByDebateAndUser($debate, $viewer)
            ->willReturn(0)
            ->shouldBeCalled()
        ;

        $this->__invoke($debate, $viewer)->shouldReturn(false);
    }

    public function it_throws_if_viewer_has_no_session(Debate $debate)
    {
        $this->shouldThrow(UserWarning::class)->during('__invoke', [$debate, null]);
    }

    public function it_throws_if_viewer_has_an_anonymous_session(Debate $debate)
    {
        $this->shouldThrow(UserWarning::class)->during('__invoke', [$debate, 'anon.']);
    }
}
