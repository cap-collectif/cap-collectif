<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateVotesResolver;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class DebateVotesResolverSpec extends ObjectBehavior
{
    public function let(VoteSearch $voteSearch, LoggerInterface $logger)
    {
        $this->beConstructedWith($voteSearch, $logger);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateVotesResolver::class);
    }

    public function it_resolve_empty_connection(
        VoteSearch $voteSearch,
        LoggerInterface $logger,
        Debate $debate,
        ElasticsearchPaginatedResult $paginatedResult
    ) {
        $args = new Argument([
            'first' => 0,
            'after' => null,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
            'isPublished' => null,
        ]);
        $filters = ['published' => true];

        $paginatedResult->getTotalCount()->willReturn(0);
        $paginatedResult->getCursors()->willReturn([]);
        $paginatedResult->getEntities()->willReturn([]);

        $voteSearch
            ->searchDebateVote(
                $debate,
                $filters,
                0,
                ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
                null
            )
            ->willReturn($paginatedResult)
            ->shouldBeCalled()
        ;
        $this->__invoke($debate, $args, null)->shouldReturnEmptyConnection([]);
    }

    public function it_resolve_votes(
        Debate $debate,
        VoteSearch $voteSearch,
        ElasticsearchPaginatedResult $paginatedResult,
        DebateVote $a,
        DebateVote $b
    ) {
        $args = new Argument([
            'first' => 10,
            'after' => null,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
            'isPublished' => null,
        ]);

        $filters = [
            'published' => true,
        ];

        $paginatedResult->getTotalCount()->willReturn(2);
        $paginatedResult->getCursors()->willReturn([['cursor1'], ['cursor2']]);
        $paginatedResult->getEntities()->willReturn([$a, $b]);

        $voteSearch
            ->searchDebateVote(
                $debate,
                $filters,
                11,
                ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
                null
            )
            ->willReturn($paginatedResult)
            ->shouldBeCalled()
        ;
        $this->__invoke($debate, $args, null)->shouldReturnConnection();
    }
}
