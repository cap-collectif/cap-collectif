<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateArgumentVotesResolver;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class DebateArgumentVotesResolverSpec extends ObjectBehavior
{
    public function let(VoteSearch $voteSearch)
    {
        $this->beConstructedWith($voteSearch);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateArgumentVotesResolver::class);
    }

    public function it_resolve_empty_connection(
        VoteSearch $voteSearch,
        DebateArgument $debateArgument,
        ElasticsearchPaginatedResult $elasticsearchPaginatedResult
    ) {
        $args = new Argument([
            'first' => 0,
            'after' => null,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
        ]);
        $voteSearch
            ->searchDebateArgumentVotes(
                $debateArgument,
                0,
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any()
            )
            ->willReturn($elasticsearchPaginatedResult)
            ->shouldBeCalled()
        ;
        $elasticsearchPaginatedResult->getEntities()->willReturn([]);
        $elasticsearchPaginatedResult->getCursors()->willReturn([]);
        $elasticsearchPaginatedResult->getTotalCount()->willReturn(0);
        $this->__invoke($debateArgument, $args)->shouldReturnEmptyConnection([]);
    }

    public function it_resolve_votes(
        VoteSearch $voteSearch,
        DebateArgument $debateArgument,
        ElasticsearchPaginatedResult $elasticsearchPaginatedResult,
        DebateArgumentVote $a,
        DebateArgumentVote $b
    ) {
        $args = new Argument([
            'first' => 10,
            'after' => null,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
        ]);
        $voteSearch
            ->searchDebateArgumentVotes(
                $debateArgument,
                11,
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any()
            )
            ->willReturn($elasticsearchPaginatedResult)
            ->shouldBeCalled()
        ;
        $elasticsearchPaginatedResult->getEntities()->willReturn([$a, $b]);
        $elasticsearchPaginatedResult->getCursors()->willReturn([['a'], ['b']]);
        $elasticsearchPaginatedResult->getTotalCount()->willReturn(2);
        $this->__invoke($debateArgument, $args)->shouldReturnConnection();
    }
}
