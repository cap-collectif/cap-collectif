<?php

namespace Capco\AppBundle\Client;

use Capco\AdminBundle\Timezone\GlobalConfigurationTimeZoneDetector;
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
use Elastica\Query\BoolQuery;
use Elastica\Query\Range;
use Elastica\Query\Term;
use Psr\Log\LoggerInterface;

class CloudflareElasticClient
{
    private readonly Client $esClient;
    private readonly LoggerInterface $esLoggerCollector;
    private string $index;

    public function __construct(
        private readonly LoggerInterface $logger,
        LoggerInterface $esLoggerCollector,
        private string $hostname,
        string $environment,
        string $elasticsearchHost,
        string $logpushElasticsearchHost,
        string $logpushElasticsearchIndex,
        string $logpushElasticsearchUsername,
        string $logpushElasticsearchPassword,
        string $logpushElasticsearchPort,
        private readonly GlobalConfigurationTimeZoneDetector $timezoneDetector
    ) {
        $this->hostname = strtolower($hostname);
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
        } catch (ClientException) {
            $this->esClient->addConnection(new Connection($this->esClient->getConfig()));
            $searchResult = $multisearchQuery->search();
        } catch (HttpException) {
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
            $end,
            $projectSlug,
            $requestedFields
        );
        $multisearchQuery->addSearches($searchQueries);

        try {
            $searchResult = $multisearchQuery->search();
        } catch (HttpException) {
            $searchResult = null;
            $this->logger->error('External analytic multi search query timed out.', [
                'project_slug' => $projectSlug,
                'date_interval' => compact($start, $end),
            ]);
        }

        return $searchResult;
    }

    /**
     * Checks if ALL documents for date range (and projectSlug) have "clientIP" field,
     * so that we can use it later.
     */
    public function canUseClientIpField(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug
    ): bool {
        $useragentFieldSearchQuery = new Search($this->esClient);

        // Actually counting how many documents don't have "clientIP" field.
        $boolQuery = new Query\BoolQuery();

        $boolQuery
            ->addFilter(new Query\Term(['clientRequestHost.keyword' => $this->hostname]))
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addMustNot(
                (new Query\Exists('clientIP'))
            )
        ;

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query->setSize(1);

        $useragentFieldSearchQuery->addSearch($this->createSearchQuery($query));

        $searchResult = $useragentFieldSearchQuery->search()->getResponse()->getData();

        // If zero results, it means that ALL documents have the field.
        return isset($searchResult['responses'][0]['hits']['total']['value'])
            && 0 === $searchResult['responses'][0]['hits']['total']['value'];
    }

    /**
     * @param string[] $sources
     *
     * @return array<string, mixed>
     */
    public function getGeoIpByIpAddress(string $ipAddress, array $sources): ?array
    {
        $boolQuery = (new BoolQuery())
            ->addFilter(new Term(['clientIP' => $ipAddress]))
        ;

        $query = (new Query($boolQuery))
            ->setSource($sources)
            ->setSize(1)
        ;

        $response = $this->esClient->getIndex($this->index)->search($query);

        if ([] === $response->getResults()) {
            return null;
        }

        return $response->current()->getData()['geoip'];
    }

    private function createUniqueVisitorsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(new Query\Term(['clientRequestHost.keyword' => $this->hostname]))
            ->addMustNot(
                (new Query\BoolQuery())->addFilter(
                    new Query\Terms('clientIPClass.keyword', ['searchEngine', 'monitoringService', 'badHost', 'scan'])
                )
            )
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
        ;

        $dateHistogram = (new DateHistogram(
            'visitors_per_interval',
            'edgeEndTimestamp',
            $this->getDateHistogramInterval($start, $end)
        ))
            ->setParam('min_doc_count', 0)
            ->setParam('extended_bounds', [
                'min' => $start->format('Y-m-d\TH:i'),
                'max' => $end->format('Y-m-d\TH:i'),
            ])
            ->setTimezone($this->timezoneDetector->getTimezone())
            ->addAggregation(
                (new Cardinality('unique_visitors_per_interval'))->setField('clientIP.keyword')
            )
        ;

        if ($this->canUseClientIpField($start, $end, $projectSlug)) {
            $dateHistogram
                ->addAggregation(
                    (new Cardinality('unique_visitors_per_interval'))->setField('clientIP.keyword')
                )
            ;
        } else {
            $dateHistogram
                ->addAggregation(
                    (new Cardinality('unique_visitors_per_interval'))->setField('uniqueVisitorFingerprint.keyword')
                )
            ;
        }

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation($dateHistogram)
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
            ->addMustNot(
                (new Query\BoolQuery())->addFilter(
                    new Query\Terms('clientIPClass.keyword', ['searchEngine', 'monitoringService', 'badHost', 'scan'])
                )
            )
            ->addFilter(
                new Range('edgeEndTimestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
        ;

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                (new DateHistogram(
                    'page_view_per_interval',
                    'edgeEndTimestamp',
                    $this->getDateHistogramInterval($start, $end)
                ))
                    ->setParam('min_doc_count', 0)
                    ->setParam('extended_bounds', [
                        'min' => $start->format('Y-m-d\TH:i'),
                        'max' => $end->format('Y-m-d\TH:i'),
                    ])
                    ->setTimezone($this->timezoneDetector->getTimezone())
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
                    'lt' => $end->format(DateTimeInterface::ATOM),
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
                    'lt' => $end->format(DateTimeInterface::ATOM),
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
                    'lt' => $end->format(DateTimeInterface::ATOM),
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
                    'lt' => $end->format(DateTimeInterface::ATOM),
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
                    'lt' => $end->format(DateTimeInterface::ATOM),
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
