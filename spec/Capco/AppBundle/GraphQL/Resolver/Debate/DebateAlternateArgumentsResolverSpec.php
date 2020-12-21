<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateAlternateArgumentsResolver;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;

class DebateAlternateArgumentsResolverSpec extends ObjectBehavior
{
    public function let(DebateArgumentRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateAlternateArgumentsResolver::class);
    }

    public function it_resolve_empty_connection(
        DebateArgumentRepository $repository,
        Debate $debate
    ) {
        $args = new Argument([
            'first' => 0,
            'after' => null,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
        ]);
        $filters = [
            'isPublished' => true,
            'isTrashed' => false,
        ];
        $repository
            ->countByDebate($debate, $filters)
            ->willReturn(0)
            ->shouldBeCalled();
        $this->__invoke($debate, $args, null)->shouldReturnEmptyConnection();
    }

    public function it_resolve_arguments(
        DebateArgumentRepository $repository,
        Debate $debate,
        Paginator $forPaginator,
        Paginator $againstPaginator,
        DebateArgument $a,
        DebateArgument $b,
        DebateArgument $c
    ) {
        $args = new Argument([
            'first' => 10,
            'after' => null,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
        ]);
        $filters = [
            'isPublished' => true,
            'isTrashed' => false,
        ];
        $forFilters = [
            'isPublished' => true,
            'isTrashed' => false,
            'value' => 'FOR',
        ];
        $againstFilters = [
            'isPublished' => true,
            'isTrashed' => false,
            'value' => 'AGAINST',
        ];
        $orderBy = [
            'field' => 'publishedAt',
            'direction' => 'DESC',
        ];
        $repository
            ->getByDebate($debate, 11, 0, $forFilters, $orderBy)
            ->willReturn($forPaginator)
            ->shouldBeCalled();
        $repository
            ->getByDebate($debate, 11, 0, $againstFilters, $orderBy)
            ->willReturn($againstPaginator)
            ->shouldBeCalled();
        $repository
            ->countByDebate($debate, $filters)
            ->willReturn(3)
            ->shouldBeCalled();
        $forPaginator->getIterator()->willReturn(new \ArrayIterator([$a, $b]));
        $againstPaginator->getIterator()->willReturn(new \ArrayIterator([$c]));
        $this->__invoke($debate, $args, null)->shouldReturnConnection();
    }
}
