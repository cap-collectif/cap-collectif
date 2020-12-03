<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateArgumentsResolver;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;

class DebateArgumentsResolverSpec extends ObjectBehavior
{
    public function let(DebateArgumentRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateArgumentsResolver::class);
    }

    public function it_resolve_empty_connection(
        DebateArgumentRepository $repository,
        Debate $debate
    ) {
        $args = new Argument(['first' => 0, 'after' => null]);
        $filters = ['publishedOnly' => true];
        $repository
            ->countByDebate($debate, $filters)
            ->willReturn(0)
            ->shouldBeCalled();
        $this->__invoke($debate, $args, null)->shouldReturnEmptyConnection();
    }

    public function it_resolve_arguments(
        DebateArgumentRepository $repository,
        Debate $debate,
        Paginator $paginator,
        DebateArgument $a,
        DebateArgument $b
    ) {
        $args = new Argument(['first' => 10, 'after' => null]);
        $filters = ['publishedOnly' => true];
        $repository
            ->getByDebate($debate, 11, 0, $filters, null)
            ->willReturn($paginator)
            ->shouldBeCalled();
        $repository
            ->countByDebate($debate, $filters)
            ->willReturn(2)
            ->shouldBeCalled();
        $paginator->getIterator()->willReturn(new \ArrayIterator([$a, $b]));
        $this->__invoke($debate, $args, null)->shouldReturnConnection();
    }
}
