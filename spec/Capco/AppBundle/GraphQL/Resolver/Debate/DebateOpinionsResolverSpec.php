<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateOpinionsResolver;
use Capco\AppBundle\Repository\DebateOpinionRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class DebateOpinionsResolverSpec extends ObjectBehavior
{
    public function let(DebateOpinionRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateOpinionsResolver::class);
    }

    public function it_resolve_empty_connection(DebateOpinionRepository $repository, Debate $debate)
    {
        $args = new Argument(['first' => 0, 'after' => null]);
        $repository
            ->countByDebate($debate)
            ->willReturn(0)
            ->shouldBeCalled()
        ;
        $this->__invoke($debate, $args)->shouldReturnEmptyConnection([]);
    }

    public function it_resolve_opinions(
        DebateOpinionRepository $repository,
        Debate $debate,
        Paginator $paginator,
        DebateOpinion $a,
        DebateOpinion $b
    ) {
        $args = new Argument(['first' => 10, 'after' => null]);
        $repository
            ->getByDebate($debate, 11, 0)
            ->willReturn($paginator)
            ->shouldBeCalled()
        ;
        $repository
            ->countByDebate($debate)
            ->willReturn(2)
            ->shouldBeCalled()
        ;
        $paginator->getIterator()->willReturn(new \ArrayIterator([$a, $b]));
        $this->__invoke($debate, $args)->shouldReturnConnection();
    }
}
