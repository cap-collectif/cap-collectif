<?php

namespace Capco\AppBundle\Client;

use Capco\AppBundle\Elasticsearch\Client;
use Capco\AppBundle\Enum\PlatformAnalyticsTrafficSourceType;
use DateTimeInterface;
use Elastica\Aggregation\Cardinality;
use Elastica\Aggregation\DateHistogram;
use Elastica\Aggregation\Terms;
use Elastica\Connection;
use Elastica\Exception\ClientException;
use Elastica\Exception\Connection\HttpException;
use Elastica\Multi\ResultSet;
use Elastica\Multi\Search;
use Elastica\Query;
use Elastica\Query\Range;
use Psr\Log\LoggerInterface;

class CloudflareElasticClient
{
    private Client $esClient;
    private LoggerInterface $logger;
    private LoggerInterface $esLoggerCollector;
    private string $hostname;
    private string $index;

    public function __construct(
        LoggerInterface $logger,
        LoggerInterface $esLoggerCollector,
        string $hostname,
        string $environment,
        string $elasticsearchHost,
        string $logpushElasticsearchHost,
        string $logpushElasticsearchIndex,
        string $logpushElasticsearchUsername,
        string $logpushElasticsearchPassword,
        string $logpushElasticsearchPort
    ) {
        $this->hostname = $hostname;
        $this->logger = $logger;
        $this->esClient = $this->createEsClient(
            $environment,
            $elasticsearchHost,
            $esLoggerCollector,
            $logpushElasticsearchHost,
            $logpushElasticsearchIndex,
            $logpushElasticsearchUsername,
            $logpushElasticsearchPassword,
            $logpushElasticsearchPort
        );
    }

    public function getTrafficSourcesAnalyticsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): ?ResultSet {
        $multisearchQuery = new Search($this->esClient);
        $multisearchQuery->addSearches([
            PlatformAnalyticsTrafficSourceType::SEARCH_ENGINE => $this->createSearchEngineEntriesQuery(
                $start,
                $end,
                $projectSlug
            ),
            PlatformAnalyticsTrafficSourceType::SOCIAL_NETWORK => $this->createSocialNetworksEntriesQuery(
                $start,
                $end,
                $projectSlug
            ),
            PlatformAnalyticsTrafficSourceType::DIRECT => $this->createDirectEntriesQuery(
                $start,
                $end,
                $projectSlug
            ),
            PlatformAnalyticsTrafficSourceType::EXTERNAL_LINK => $this->createExternalEntriesQuery(
                $start,
                $end,
                $projectSlug
            ),
        ]);

        try {
            $searchResult = $multisearchQuery->search();
        } catch (ClientException $clientException) {
            $this->esClient->addConnection(new Connection($this->esClient->getConfig()));
            $searchResult = $multisearchQuery->search();
        } catch (HttpException $exception) {
            $searchResult = null;
            $this->logger->error('Traffic source multi search query timed out.', [
                'project_slug' => $projectSlug,
                'date_interval' => compact($start, $end),
            ]);
        }

        return $searchResult;
    }

    public function getExternalAnalyticsSearches(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug,
        array $requestedFields
    ): array {
        $searchQueries = [];

        if (\in_array('visitors', $requestedFields, true)) {
            $searchQueries['visitors'] = $this->createUniqueVisitorsQuery(
                $start,
                $end,
                $projectSlug
            );
        }
        if (\in_array('pageViews', $requestedFields, true)) {
            $searchQueries['pageViews'] = $this->createPageViewsQuery($start, $end, $projectSlug);
        }
        if (\in_array('mostVisitedPages', $requestedFields, true)) {
            $searchQueries['mostVisitedPages'] = $this->createMostVisitedPagesQuery(
                $start,
                $end,
                $projectSlug
            );
        }

        return $searchQueries;
    }

    public function getExternalAnalyticsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug,
        array $requestedFields
    ): ?ResultSet {
        $multisearchQuery = new Search($this->esClient);

        $searchQueries = $this->getExternalAnalyticsSearches(
            $start,
            $end->setTime(23, 59, 59),
            $projectSlug,
            $requestedFields
        );
        $multisearchQuery->addSearches($searchQueries);

        try {
            $searchResult = $multisearchQuery->search();
        } catch (HttpException $exception) {
            $searchResult = null;
            $this->logger->error('External analytic multi search query timed out.', [
                'project_slug' => $projectSlug,
                'date_interval' => compact($start, $end),
            ]);
        }

        return $searchResult;
    }

    private function createUniqueVisitorsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(new Query\Term(['clientRequestHost.keyword' => $this->hostname]))
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
        ;

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation((new Cardinality('unique_visitors'))->setField('clientIP.keyword'))
            ->addAggregation(
                (new DateHistogram(
                    'visitors_per_interval',
                    'edgeEndTimestamp',
                    $this->getDateHistogramInterval($start, $end)
                ))->addAggregation(
                    (new Cardinality('unique_visitors_per_interval'))->setField('clientIP.keyword')
                )
            )
        ;

        return $this->createSearchQuery($query);
    }

    private function createPageViewsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(new Query\Term(['clientRequestHost.keyword' => $this->hostname]))
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
        ;

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                new DateHistogram(
                    'page_view_per_interval',
                    'edgeEndTimestamp',
                    $this->getDateHistogramInterval($start, $end)
                )
            )
        ;

        return $this->createSearchQuery($query);
    }

    private function createMostVisitedPagesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['clientRequestHost.keyword' => $this->hostname]))
        ;

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                (new Terms('most_seen_pages'))
                    ->setField('clientRequestURI.keyword')
                    ->setOrder('_count', 'desc')
                    ->setSize(10)
            )
        ;

        return $this->createSearchQuery($query);
    }

    private function createSearchEngineEntriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                (new Query\BoolQuery())
                    ->addShould(
                        (new Query\BoolQuery())->addFilter(
                            new Query\Term(['clientIPClass' => 'searchEngine'])
                        )
                    )
                    ->addShould(
                        (new Query\BoolQuery())->addFilter(
                            new Query\Term(['searchEngineReferer' => true])
                        )
                    )
            )
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['clientRequestHost.keyword' => $this->hostname]))
        ;

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->addAggregation(
                (new Cardinality('search_engine_entries'))->setField('clientIP.keyword')
            )
            ->setSize(0)
            ->setTrackTotalHits(true)
        ;

        return $this->createSearchQuery($query);
    }

    private function createSocialNetworksEntriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['socialNetworkReferer' => true]))
            ->addFilter(new Query\Term(['clientRequestHost.keyword' => $this->hostname]))
        ;

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query->setSize(0)->setTrackTotalHits(true);

        return $this->createSearchQuery($query);
    }

    private function createDirectEntriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['clientRequestHost.keyword' => $this->hostname]))
            ->addMustNot(new Query\Exists('clientRequestReferer'))
            ->addMustNot(new Query\Exists('socialNetworkReferer'))
        ;

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query->setSize(0)->setTrackTotalHits(true);

        return $this->createSearchQuery($query);
    }

    private function createExternalEntriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Exists('clientRequestReferer'))
            ->addMustNot(new Query\Term(['socialNetworkReferer' => true]))
            ->addMustNot(new Query\Term(['searchEngineReferer' => true]))
            ->addFilter(new Query\Term(['clientRequestHost.keyword' => $this->hostname]))
        ;

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query->setSize(0)->setTrackTotalHits(true);

        return $this->createSearchQuery($query);
    }

    private function filterClientRequestURIByProject(
        Query\BoolQuery $boolQuery,
        ?string $projectSlug = null
    ): Query\BoolQuery {
        if ($projectSlug) {
            $boolQuery->addFilter(new Query\Term(['projectSlug.keyword' => $projectSlug]));
        }

        return $boolQuery;
    }

    private function createEsClient(
        string $environment,
        string $elasticsearchHost,
        LoggerInterface $logger,
        string $logpushElasticsearchHost,
        string $logpushElasticsearchIndex,
        string $logpushElasticsearchUsername,
        string $logpushElasticsearchPassword,
        string $logpushElasticsearchPort
    ): Client {
        $devOrTest = \in_array($environment, ['dev', 'test'], true);
        $this->index = $devOrTest ? 'analytics_test' : $logpushElasticsearchIndex;

        return new Client(
            [
                'host' => $devOrTest ? $elasticsearchHost : $logpushElasticsearchHost,
                'port' => $devOrTest ? '9200' : $logpushElasticsearchPort,
                'username' => $devOrTest ? '' : $logpushElasticsearchUsername,
                'password' => $devOrTest ? '' : $logpushElasticsearchPassword,
                'transport' => $devOrTest ? 'http' : 'https',
                'log' => true,
                'persistent' => false,
            ],
            null,
            $logger,
            $devOrTest
        );
    }

    /**
     * Redefine the pitch of the date histogram to years if the difference
     * between its start date and its end date is greater than 1 year.
     *
     * It avoid getting too much data on a low pitch.
     */
    private function getDateHistogramInterval(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): string {
        $daysDiff = $start->diff($end)->days;
        $dateHistogramInterval = 'day';
        if ($daysDiff > 365) {
            $dateHistogramInterval = 'month';
        }

        return $dateHistogramInterval;
    }

    private function createSearchQuery(Query $query): \Elastica\Search
    {
        return $this->esClient->getIndex($this->index)->createSearch($query);
    }
}
