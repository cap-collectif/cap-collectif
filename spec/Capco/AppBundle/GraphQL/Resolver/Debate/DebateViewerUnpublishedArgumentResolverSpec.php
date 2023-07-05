<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateViewerUnpublishedArgumentResolver;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserWarning;
use PhpSpec\ObjectBehavior;

class DebateViewerUnpublishedArgumentResolverSpec extends ObjectBehavior
{
    public function let(DebateArgumentRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateViewerUnpublishedArgumentResolver::class);
    }

    public function it_should_resolve_viewer_unpublished_argument(
        Debate $debate,
        User $viewer,
        DebateArgumentRepository $repository,
        DebateArgument $argument
    ) {
        $repository
            ->getUnpublishedByDebateAndUser($debate, $viewer)
            ->willReturn($argument)
            ->shouldBeCalled()
        ;

        $this->__invoke($debate, $viewer)->shouldReturn($argument);
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
