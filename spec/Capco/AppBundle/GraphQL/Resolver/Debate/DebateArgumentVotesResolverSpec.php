<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateArgumentVotesResolver;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;

class DebateArgumentVotesResolverSpec extends ObjectBehavior
{
    public function let(DebateArgumentVoteRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateArgumentVotesResolver::class);
    }

    public function it_resolve_empty_connection(
        DebateArgumentVoteRepository $repository,
        DebateArgument $debateArgument
    ) {
        $args = new Argument(['first' => 0, 'after' => null]);
        $repository
            ->countByDebateArgument($debateArgument)
            ->willReturn(0)
            ->shouldBeCalled();
        $this->__invoke($debateArgument, $args)->shouldReturnEmptyConnection();
    }

    public function it_resolve_votes(
        DebateArgumentVoteRepository $repository,
        DebateArgument $debateArgument,
        Paginator $paginator,
        DebateArgumentVote $a,
        DebateArgumentVote $b
    ) {
        $args = new Argument([
            'first' => 10,
            'after' => null,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
        ]);
        $repository
            ->getByDebateArgument($debateArgument, 11, 0, ['field' => 'publishedAt', 'direction' => 'DESC'])
            ->willReturn($paginator)
            ->shouldBeCalled();
        $repository
            ->countByDebateArgument($debateArgument)
            ->willReturn(2)
            ->shouldBeCalled();
        $paginator->getIterator()->willReturn(new \ArrayIterator([$a, $b]));
        $this->__invoke($debateArgument, $args)->shouldReturnConnection();
    }
}
