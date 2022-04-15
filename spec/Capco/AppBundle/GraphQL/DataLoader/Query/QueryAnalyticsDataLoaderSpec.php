<?php

namespace spec\Capco\AppBundle\GraphQL\DataLoader\Query;

use DateTimeInterface;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Cache\RedisTagCache;
use Symfony\Component\Stopwatch\Stopwatch;
use Capco\AppBundle\Search\AnalyticsSearch;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Client\CloudflareElasticClient;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use GraphQL\Executor\Promise\Adapter\SyncPromiseAdapter;
use Capco\AppBundle\Elasticsearch\AnalyticsTopContributors;
use Capco\AppBundle\Elasticsearch\AnalyticsMostUsedProposalCategories;
use Capco\AppBundle\GraphQL\DataLoader\Query\QueryAnalyticsDataLoader;

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

    public function it_resolve_without_requested_fields(PromiseAdapterInterface $promiseFactory)
    {
        $keys = [
            [
                'startAt' => (new \DateTime('2022-02-23 10:55:30'))->format(
                    DateTimeInterface::ATOM
                ),
                'endAt' => (new \DateTime('2022-10-31 23:59:00'))->format(DateTimeInterface::ATOM),
                'projectId' => null,
                'requestedFields' => ['pageViews', 'trafficSources'],
                'topContributorsCount' => 5,
            ],
        ];

        $results = [
            [
                'pageViews' => null,
                'trafficSources' => null,
            ],
        ];

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll($results)
            ->shouldBeCalled()
            ->willReturn($promise);

        $this->all($keys)->shouldReturn($promise);
    }
}
