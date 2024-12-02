<?php

namespace spec\Capco\AppBundle\GraphQL\DataLoader\Query;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Client\CloudflareElasticClient;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Elasticsearch\AnalyticsMostUsedProposalCategories;
use Capco\AppBundle\Elasticsearch\AnalyticsTopContributors;
use Capco\AppBundle\GraphQL\DataLoader\Query\QueryAnalyticsDataLoader;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Search\AnalyticsSearch;
use DateTimeInterface;
use Elastica\Multi\ResultSet;
use GraphQL\Executor\Promise\Adapter\SyncPromiseAdapter;
use GraphQL\Executor\Promise\Promise;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class QueryAnalyticsDataLoaderSpec extends ObjectBehavior
{
    public function let(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        AnalyticsSearch $analyticsSearch,
        ProjectRepository $projectRepository,
        CloudflareElasticClient $cloudflareElasticClient,
        AnalyticsTopContributors $analyticsTopContributors,
        AnalyticsMostUsedProposalCategories $analyticsMostUsedProposalCategories
    ) {
        $this->beConstructedWith(
            $analyticsSearch,
            $projectRepository,
            $cloudflareElasticClient,
            $promiseFactory,
            $cache,
            $logger,
            'prefix',
            60,
            false,
            $collector,
            $stopwatch,
            false,
            $analyticsTopContributors,
            $analyticsMostUsedProposalCategories
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(QueryAnalyticsDataLoader::class);
    }

    public function it_resolve_with_only_internal_fields(
        PromiseAdapterInterface $promiseFactory,
        AnalyticsSearch $analyticsSearch,
        ResultSet $multiResultSet,
        \Elastica\ResultSet $resultSetA,
        \Elastica\ResultSet $resultSetB
    ) {
        $keys = [
            [
                'startAt' => (new \DateTime('2022-02-23 10:55:30'))->format(
                    DateTimeInterface::ATOM
                ),
                'endAt' => (new \DateTime('2022-10-31 23:59:00'))->format(DateTimeInterface::ATOM),
                'projectId' => null,
                'requestedFields' => ['registrations', 'votes'],
                'topContributorsCount' => 5,
            ],
        ];

        $resultSetA->getAggregation('registrations')->willReturn(['buckets' => []]);
        $resultSetA->getTotalHits()->willReturn(10);
        $resultSetB->getAggregation('votes')->willReturn(['buckets' => []]);
        $resultSetB->getTotalHits()->willReturn(20);

        $multiResultSet->getResultSets()->willReturn([
            'registrations' => $resultSetA,
            'votes' => $resultSetB,
        ]);

        $analyticsSearch
            ->getInternalAnalyticsResultSet(
                Argument::any(),
                Argument::any(),
                $keys[0]['topContributorsCount'],
                $keys[0]['requestedFields'],
                $keys[0]['projectId']
            )
            ->shouldBeCalled()
            ->willReturn($multiResultSet)
        ;

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll(
                Argument::that(fn (array $results): bool => array_keys($results[0]) == ['registrations', 'votes'])
            )
            ->shouldBeCalled()
            ->willReturn($promise)
        ;

        $this->all($keys)->shouldReturn($promise);
    }

    public function it_resolve_with_only_external_fields(
        PromiseAdapterInterface $promiseFactory,
        CloudflareElasticClient $cloudflareElasticClient,
        ResultSet $multiResultSet,
        \Elastica\ResultSet $resultSetA
    ) {
        $keys = [
            [
                'startAt' => (new \DateTime('2022-02-23 10:55:30'))->format(
                    DateTimeInterface::ATOM
                ),
                'endAt' => (new \DateTime('2022-10-31 23:59:00'))->format(DateTimeInterface::ATOM),
                'projectId' => null,
                'requestedFields' => ['visitors'],
                'topContributorsCount' => 5,
            ],
        ];

        $resultSetA->getAggregation('visitors_per_interval')->willReturn(['buckets' => []]);
        $resultSetA->getAggregation('unique_visitors')->willReturn(['value' => 10]);

        $multiResultSet->getResultSets()->willReturn([
            'visitors' => $resultSetA,
        ]);

        $cloudflareElasticClient
            ->getExternalAnalyticsResultSet(
                Argument::any(),
                Argument::any(),
                null,
                $keys[0]['requestedFields']
            )
            ->shouldBeCalled()
            ->willReturn($multiResultSet)
        ;

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll(
                Argument::that(fn (array $results): bool => array_keys($results[0]) == ['visitors'])
            )
            ->shouldBeCalled()
            ->willReturn($promise)
        ;

        $this->all($keys)->shouldReturn($promise);
    }
}
