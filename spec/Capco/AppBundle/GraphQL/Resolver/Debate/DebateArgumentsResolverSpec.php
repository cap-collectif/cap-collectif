<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateArgumentsResolver;
use Capco\AppBundle\Search\DebateSearch;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Debate\Debate;
use Overblog\GraphQLBundle\Definition\Argument;

class DebateArgumentsResolverSpec extends ObjectBehavior
{
    public function let(DebateSearch $debateSearch)
    {
        $this->beConstructedWith($debateSearch);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateArgumentsResolver::class);
    }

    public function it_resolve_empty_connection(
        DebateSearch $debateSearch,
        Debate $debate,
        ElasticsearchPaginatedResult $result
    ) {
        $args = new Argument(['first' => 0, 'after' => null]);
        $filters = [
            'isPublished' => true,
            'isTrashed' => false,
        ];
        $debateSearch
            ->searchDebateArguments(
                $debate,
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any(),
                $filters,
                \Prophecy\Argument::any()
            )
            ->willReturn($result)
            ->shouldBeCalled();
        $result->getEntities()->willReturn([]);
        $result->getCursors()->willReturn([]);
        $result->getTotalCount()->willReturn(0);
        $this->__invoke($debate, $args, null)->shouldReturnEmptyConnection();
    }

    public function it_resolve_arguments(
        DebateSearch $debateSearch,
        Debate $debate,
        ElasticsearchPaginatedResult $result,
        DebateArgument $a,
        DebateArgument $b
    ) {
        $args = new Argument(['first' => 10, 'after' => null]);
        $filters = [
            'isPublished' => true,
            'isTrashed' => false,
        ];
        $debateSearch
            ->searchDebateArguments(
                $debate,
                11,
                \Prophecy\Argument::any(),
                $filters,
                \Prophecy\Argument::any()
            )
            ->willReturn($result)
            ->shouldBeCalled();
        $result->getEntities()->willReturn([$a, $b]);
        $result->getCursors()->willReturn([['a'], ['b']]);
        $result->getTotalCount()->willReturn(2);
        $this->__invoke($debate, $args, null)->shouldReturnConnection();
    }
}
