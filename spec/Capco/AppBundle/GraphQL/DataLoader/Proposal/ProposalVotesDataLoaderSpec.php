<?php

namespace spec\Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\Search\VoteSearch;
use GraphQL\Executor\Promise\Adapter\SyncPromiseAdapter;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ProposalVotesDataLoaderSpec extends ObjectBehavior
{
    public function let(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        VoteSearch $voteSearch,
        GraphQLCollector $collector,
        Stopwatch $stopwatch
    ) {
        $this->beConstructedWith(
            $promiseFactory,
            $cache,
            $logger,
            $voteSearch,
            'prefix',
            60,
            false,
            $collector,
            $stopwatch,
            true
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalVotesDataLoader::class);
    }

    public function it_resolve_with_same_bools(
        Proposal $proposal1,
        Proposal $proposal2,
        Connection $connection1,
        Connection $connection2,
        VoteSearch $voteSearch,
        ProposalCollectVote $vote1,
        ProposalCollectVote $vote2,
        PromiseAdapterInterface $promiseFactory
    ) {
        $proposal1->getId()->willReturn('proposal1');
        $proposal2->getId()->willReturn('proposal2');

        $keys = [
            [
                'proposal' => $proposal1,
                'step' => null,
                'args' => new Arg(['first' => 0]),
                'includeUnpublished' => true,
                'includeNotAccounted' => true,
            ],
            [
                'proposal' => $proposal2,
                'step' => null,
                'args' => new Arg(['first' => 100]),
                'includeUnpublished' => true,
                'includeNotAccounted' => true,
            ],
        ];

        $res1 = new ElasticsearchPaginatedResult([$vote1], [['azerty']], 1);
        $res1->totalPointsCount = 3;
        $res2 = new ElasticsearchPaginatedResult([$vote1, $vote2], [['uiop'], ['uioazp']], 2);
        $res2->totalPointsCount = 7;
        $voteSearch
            ->searchProposalVotes($keys)
            ->shouldBeCalled()
            ->willReturn([$res1, $res2])
        ;

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll(
                Argument::that(fn ($connections): bool => 2 === \count($connections)
                    && 1 === $connections[0]->totalCount
                    && 3 === $connections[0]->totalPointsCount
                    && 2 === $connections[1]->totalCount
                    && 7 === $connections[1]->totalPointsCount)
            )
            ->shouldBeCalled()
            ->willReturn($promise)
        ;

        $this->all($keys)->shouldReturn($promise);
    }

    public function it_resolve_with_different_bools(
        Proposal $proposal1,
        Proposal $proposal2,
        Connection $connection1,
        Connection $connection2,
        VoteSearch $voteSearch,
        ProposalCollectVote $vote1,
        ProposalCollectVote $vote2,
        PromiseAdapterInterface $promiseFactory
    ) {
        $proposal1->getId()->willReturn('proposal1');
        $proposal2->getId()->willReturn('proposal2');

        $keys = [
            [
                'proposal' => $proposal1,
                'step' => null,
                'args' => new Arg(['first' => 0]),
                'includeUnpublished' => true,
                'includeNotAccounted' => true,
            ],
            [
                'proposal' => $proposal2,
                'step' => null,
                'args' => new Arg(['first' => 100]),
                'includeUnpublished' => false,
                'includeNotAccounted' => false,
            ],
        ];

        $res1 = new ElasticsearchPaginatedResult([$vote1], [['azerty']], 1);
        $res1->totalPointsCount = 3;
        $res2 = new ElasticsearchPaginatedResult([$vote1, $vote2], [['uiop'], ['uioazp']], 2);
        $res2->totalPointsCount = 7;

        $voteSearch
            ->searchProposalVotes($keys)
            ->shouldBeCalled()
            ->willReturn([$res1, $res2])
        ;

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll(
                Argument::that(fn ($connections): bool => 2 === \count($connections)
                    && 1 === $connections[0]->totalCount
                    && 3 === $connections[0]->totalPointsCount
                    && 2 === $connections[1]->totalCount
                    && 7 === $connections[1]->totalPointsCount)
            )
            ->shouldBeCalled()
            ->willReturn($promise)
        ;

        $this->all($keys)->shouldReturn($promise);
    }
}
