<?php

namespace spec\Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Search\VoteSearch;
use Capco\AppBundle\Cache\RedisTagCache;
use Symfony\Component\Stopwatch\Stopwatch;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use GraphQL\Executor\Promise\Adapter\SyncPromiseAdapter;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Overblog\GraphQLBundle\Definition\Argument as Arg;

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

        $voteSearch
            ->searchProposalVotes($keys)
            ->shouldBeCalled()
            ->willReturn([
                new ElasticsearchPaginatedResult([$vote1], [['azerty']], 1),
                new ElasticsearchPaginatedResult([$vote1, $vote2], [['uiop'], ['uioazp']], 2),
            ]);

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll(
                Argument::that(function ($connections): bool {
                    return 2 === \count($connections) &&
                        1 === $connections[0]->totalCount &&
                        2 === $connections[1]->totalCount;
                })
            )
            ->shouldBeCalled()
            ->willReturn($promise);

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

        $voteSearch
            ->searchProposalVotes($keys)
            ->shouldBeCalled()
            ->willReturn([
                new ElasticsearchPaginatedResult([$vote1], [['azerty']], 1),
                new ElasticsearchPaginatedResult([$vote1, $vote2], [['uiop'], ['uioazp']], 2),
            ]);

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll(
                Argument::that(function ($connections): bool {
                    return 2 === \count($connections) &&
                        1 === $connections[0]->totalCount &&
                        2 === $connections[1]->totalCount;
                })
            )
            ->shouldBeCalled()
            ->willReturn($promise);

        $this->all($keys)->shouldReturn($promise);
    }
}
