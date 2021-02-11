<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateVotesResolver;

class DebateVotesResolverSpec extends ObjectBehavior
{
    public function let(DebateVoteRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateVotesResolver::class);
    }

    public function it_resolve_empty_connection(DebateVoteRepository $repository, Debate $debate)
    {
        $args = new Argument(['first' => 0, 'after' => null]);
        $filters = [
            'type' => null,
            'isPublished' => true,
        ];
        $repository
            ->countByDebate($debate, $filters)
            ->willReturn(0)
            ->shouldBeCalled();
        $this->__invoke($debate, $args)->shouldReturnEmptyConnection();
    }

    public function it_resolve_votes(
        DebateVoteRepository $repository,
        Debate $debate,
        Paginator $paginator,
        DebateVote $a,
        DebateVote $b
    ) {
        $args = new Argument([
            'first' => 10,
            'after' => null,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
        ]);
        $filters = [
            'type' => null,
            'isPublished' => true,
        ];
        $repository
            ->getByDebate(
                $debate,
                11,
                0,
                ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
                $filters
            )
            ->willReturn($paginator)
            ->shouldBeCalled();
        $repository
            ->countByDebate($debate, $filters)
            ->willReturn(2)
            ->shouldBeCalled();
        $paginator->getIterator()->willReturn(new \ArrayIterator([$a, $b]));
        $this->__invoke($debate, $args)->shouldReturnConnection();
    }
}
