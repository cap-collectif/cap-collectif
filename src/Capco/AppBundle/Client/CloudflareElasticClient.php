<?php

namespace Capco\AppBundle\Client;

use Capco\AppBundle\Enum\PlatformAnalyticsTrafficSourceType;
use Elastica\Aggregation\Cardinality;
use DateTimeInterface;
use Elastica\Aggregation\DateHistogram;
use Elastica\Aggregation\Terms;
use Elastica\Client;
use Elastica\Multi\ResultSet;
use Elastica\Query;
use Elastica\Query\Range;
use Elastica\Multi\Search;
use Psr\Log\LoggerInterface;

class CloudflareElasticClient
{
    private Client $esClient;
    private string $hostname;
    private string $index;

    public function __construct(
        LoggerInterface $logger,
        string $hostname,
        string $clientId,
        string $username,
        string $password,
        string $environment,
        string $elasticsearchHost
    ) {
        $this->hostname = $hostname;
        $this->esClient = $this->createEsClient(
            $clientId,
            $username,
            $password,
            $environment,
            $elasticsearchHost,
            $logger
        );
    }

    public function getTrafficSourcesAnalyticsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): ResultSet {
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

        return $multisearchQuery->search();
    }

    public function getExternalAnalyticsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): ResultSet {
        $multisearchQuery = new Search($this->esClient);
        $multisearchQuery->addSearches([
            'visitors' => $this->createUniqueVisitorsQuery($start, $end, $projectSlug),
            'pageViews' => $this->createPageViewsQuery($start, $end, $projectSlug),
            'mostVisitedPages' => $this->createMostVisitedPagesQuery($start, $end, $projectSlug),
        ]);

        return $multisearchQuery->search();
    }

    private function createUniqueVisitorsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addMustNot($this->getClientRequestURIFilters())
            ->addFilter(new Query\MatchPhrase('ClientRequestHost', $this->hostname))
            ->addFilter(
                new Range('@timestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            );

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation((new Cardinality('unique_visitors'))->setField('ClientIP.ip'))
            ->addAggregation(
                (new DateHistogram('visitors_per_interval', '@timestamp', 'month'))->addAggregation(
                    (new Cardinality('unique_visitors_per_interval'))->setField('ClientIP.ip')
                )
            );

        return $this->esClient->getIndex($this->index)->createSearch($query);
    }

    private function createPageViewsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(new Query\MatchPhrase('ClientRequestHost', $this->hostname))
            ->addMustNot($this->getClientRequestURIFilters())
            ->addFilter(
                new Range('@timestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            );

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(new DateHistogram('page_view_per_interval', '@timestamp', 'month'));

        return $this->esClient->getIndex($this->index)->createSearch($query);
    }

    private function createMostVisitedPagesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Range('@timestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\MatchPhrase('ClientRequestHost', $this->hostname))
            ->addFilter(new Query\Regexp('ClientRequestURI', $this->hostname . '/*'))
            ->addMustNot($this->getClientRequestURIFilters());

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                (new Terms('most_seen_pages'))
                    ->setField('ClientRequestURI.keyword')
                    ->setOrder('_count', 'desc')
                    ->setSize(3)
            );

        return $this->esClient->getIndex($this->index)->createSearch($query);
    }

    private function createSearchEngineEntriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Query\Regexp(
                    'ClientRequestReferer.keyword',
                    '(http|https)(://|://www.)(bing|qwant|google|ecosia|duckduckgo).*'
                )
            )
            ->addFilter(
                new Range('@timestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\MatchPhrase('ClientRequestHost', $this->hostname))
            ->addMustNot($this->getClientRequestURIFilters());

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query
            ->addAggregation((new Cardinality('search_engine_entries'))->setField('ClientIP.ip'))
            ->setSize(0)
            ->setTrackTotalHits(true);

        return $this->esClient->getIndex($this->index)->createSearch($query);
    }

    private function createSocialNetworksEntriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Range('@timestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(
                new Query\Regexp(
                    'ClientRequestReferer.keyword',
                    '(http|https)(://|://www.)(instagram|linkedin|twitter|facebook).(fr|com|uk|ca).*'
                )
            )
            ->addFilter(new Query\MatchPhrase('ClientRequestHost', $this->hostname));

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query->setSize(0)->setTrackTotalHits(true);

        return $this->esClient->getIndex($this->index)->createSearch($query);
    }

    private function createDirectEntriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Range('@timestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\MatchPhrase('ClientRequestHost', $this->hostname))
            ->addMustNot(
                array_merge(
                    [new Query\Exists('ClientRequestReferer')],
                    $this->getClientRequestURIFilters()
                )
            );

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query->setSize(0)->setTrackTotalHits(true);

        return $this->esClient->getIndex($this->index)->createSearch($query);
    }

    private function createExternalEntriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectSlug = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Range('@timestamp', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Exists('ClientRequestReferer'))
            ->addMustNot(
                array_merge(
                    [
                        new Query\Regexp(
                            'ClientRequestReferer.keyword',
                            '(http|https)(://|://www.)(instagram|linkedin|twitter|facebook).(fr|com|uk|ca).*'
                        ),
                        new Query\Regexp(
                            'ClientRequestReferer.keyword',
                            '(http|https)(://|://www.)(bing|qwant|google|ecosia|duckduckgo).*'
                        ),
                    ],
                    $this->getClientRequestURIFilters()
                )
            )
            ->addFilter(new Query\MatchPhrase('ClientRequestHost', $this->hostname));

        $query = new Query($this->filterClientRequestURIByProject($boolQuery, $projectSlug));
        $query->setSize(0)->setTrackTotalHits(true);

        return $this->esClient->getIndex($this->index)->createSearch($query);
    }

    private function filterClientRequestURIByProject(
        Query\BoolQuery $boolQuery,
        ?string $projectSlug = null
    ): Query\BoolQuery {
        if ($projectSlug) {
            $boolQuery->addFilter(
                new Query\MatchPhrase('ClientRequestURI', '/project/' . $projectSlug)
            );
        }

        return $boolQuery;
    }

    private function getClientRequestURIFilters(): array
    {
        return [
            new Query\Regexp('ClientRequestURI', '*/js/*'),
            new Query\Regexp('ClientRequestURI', '*/graphql/*'),
            new Query\Regexp('ClientRequestURI', '*/css/*'),
            new Query\Regexp('ClientRequestURI', '*/admin/*'),
            new Query\Regexp('ClientRequestURI', '*/media/*'),
        ];
    }

    private function createEsClient(
        string $clientId,
        string $username,
        string $password,
        string $environment,
        string $elasticsearchHost,
        LoggerInterface $logger
    ): Client {
        $devOrTest = \in_array($environment, ['dev', 'test'], true);
        $this->index = $devOrTest ? 'analytics_test' : 'cloudflare-*';
        $cloudUrl = explode('$', base64_decode(explode(':', $clientId)[1]));
        $formattedUrl = $cloudUrl[1] . '.' . $cloudUrl[0];

        return new Client(
            [
                'host' => $devOrTest ? $elasticsearchHost : $formattedUrl,
                'port' => $devOrTest ? '9200' : '9243',
                'username' => $username,
                'password' => $password,
                'transport' => $devOrTest ? 'http' : 'https',
            ],
            null,
            $logger
        );
    }
}
