<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateViewerUnpublishedVotesResolver;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserWarning;
use PhpSpec\ObjectBehavior;

class DebateViewerUnpublishedVotesResolverSpec extends ObjectBehavior
{
    public function let(DebateVoteRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateViewerUnpublishedVotesResolver::class);
    }

    public function it_should_resolve_viewer_unpublished_votes(
        Debate $debate,
        User $viewer,
        DebateVote $a,
        DebateVote $b,
        DebateVoteRepository $repository,
        Paginator $paginator
    ) {
        $args = new Argument([
            'first' => 10,
            'after' => null,
        ]);

        $repository
            ->getUnpublishedByDebateAndUser($debate, $viewer, 11, 0)
            ->willReturn($paginator)
            ->shouldBeCalled();
        $repository
            ->countUnpublishedByDebateAndUser($debate, $viewer)
            ->willReturn(2)
            ->shouldBeCalled();
        $paginator->getIterator()->willReturn(new \ArrayIterator([$a, $b]));

        $connection = $this->__invoke($debate, $args, $viewer);

        $connection->shouldReturnConnection();
        $connection->getTotalCount()->shouldBe(2);
        $connection->getEdges()->shouldHaveCount(2);
    }

    public function it_throws_if_viewer_has_no_session(Debate $debate, Argument $args)
    {
        $this->shouldThrow(UserWarning::class)->during('__invoke', [$debate, $args, null]);
    }

    public function it_throws_if_viewer_has_an_anonymous_session(Debate $debate, Argument $args)
    {
        $this->shouldThrow(UserWarning::class)->during('__invoke', [$debate, $args, 'anon.']);
    }
}
