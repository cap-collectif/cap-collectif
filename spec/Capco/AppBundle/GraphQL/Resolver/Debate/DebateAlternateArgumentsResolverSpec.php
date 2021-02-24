<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateAlternateArgumentsResolver;
use Capco\AppBundle\Search\DebateSearch;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Debate\Debate;
use Overblog\GraphQLBundle\Definition\Argument;

class DebateAlternateArgumentsResolverSpec extends ObjectBehavior
{
    public function let(DebateSearch $debateSearch)
    {
        $this->beConstructedWith($debateSearch);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateAlternateArgumentsResolver::class);
    }

    public function it_resolve_empty_connection(DebateSearch $debateSearch, Debate $debate)
    {
        $args = new Argument([
            'first' => 0,
            'after' => null,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
        ]);
        $filters = [
            'isPublished' => true,
            'isTrashed' => false,
        ];
        $debateSearch
            ->searchDebateArguments(
                $debate,
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any()
            )
            ->willReturn(new ElasticsearchPaginatedResult([], [], 0))
            ->shouldBeCalled();
        $this->__invoke($debate, $args, null)->shouldReturnEmptyConnection();
    }

    public function it_resolve_arguments(
        DebateSearch $debateSearch,
        Debate $debate,
        ElasticsearchPaginatedResult $forPaginator,
        ElasticsearchPaginatedResult $againstPaginator,
        ElasticsearchPaginatedResult $bothPaginator,
        DebateArgument $a,
        DebateArgument $b,
        DebateArgument $c
    ) {
        $a->getId()->willReturn('a');
        $a->getCreatedAt()->willReturn(new \DateTime('2021-01-01 00:00:00'));
        $b->getId()->willReturn('b');
        $b->getCreatedAt()->willReturn(new \DateTime('2021-01-01 00:00:00'));
        $c->getId()->willReturn('c');
        $c->getCreatedAt()->willReturn(new \DateTime('2021-01-01 00:00:00'));

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
        $debateSearch
            ->searchDebateArguments($debate, 11, $orderBy, $forFilters, \Prophecy\Argument::any())
            ->willReturn($forPaginator)
            ->shouldBeCalled();
        $debateSearch
            ->searchDebateArguments(
                $debate,
                11,
                $orderBy,
                $againstFilters,
                \Prophecy\Argument::any()
            )
            ->willReturn($againstPaginator)
            ->shouldBeCalled();
        $debateSearch
            ->searchDebateArguments($debate, 0, null, $filters, \Prophecy\Argument::any())
            ->willReturn($bothPaginator)
            ->shouldBeCalled();
        $forPaginator->getEntities()->willReturn([$a, $b]);
        $forPaginator->getTotalCount()->willReturn(2);
        $againstPaginator->getEntities()->willReturn([$c]);
        $againstPaginator->getTotalCount()->willReturn(1);
        $bothPaginator->getEntities()->willReturn([$a, $b, $c]);
        $bothPaginator->getTotalCount()->willReturn(3);
        $this->__invoke($debate, $args, null)->shouldReturnConnection();
    }
}
