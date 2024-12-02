<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;
use Elastica\Result;
use Elastica\ResultSet;

class DebateSearch extends Search
{
    public function __construct(
        Index $index,
        private readonly DebateArgumentRepository $debateArgumentRepository,
        private readonly DebateAnonymousArgumentRepository $debateAnonymousArgumentRepository
    ) {
        parent::__construct($index);
    }

    public function searchDebateArguments(
        Debate $debate,
        int $limit,
        ?array $orderBy,
        ?array $filters,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = self::createDebateArgumentsFilteredQuery($debate, $filters);

        $query = new Query($boolQuery);
        $query = $this->sortQuery($query, $orderBy);
        if ($limit) {
            $query->setSize($limit);
        }
        $this->applyCursor($query, $cursor);
        $query->setTrackTotalHits(true);
        $response = $this->index->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    public function searchUserArguments(
        User $user,
        int $limit,
        ?array $orderBy,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = self::createUserArgumentsFilteredQuery($user);

        $query = new Query($boolQuery);
        $query = $this->sortQuery($query, $orderBy);
        if ($limit) {
            $query->setSize($limit + 1);
        }
        $this->applyCursor($query, $cursor);

        $response = $this->index->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    private function sortQuery(Query $query, ?array $orderBy): Query
    {
        if ($orderBy) {
            $field = match ($orderBy['field']) {
                'votesCount' => 'votesCount',
                'CREATED_AT' => 'createdAt',
                default => 'publishedAt',
            };
            $this->setSortWithId($query, [
                $field => ['order' => $orderBy['direction']],
            ]);
        }

        return $query;
    }

    private function getData(array $cursors, ResultSet $response): ElasticsearchPaginatedResult
    {
        $hydratedResults = $this->getHydratedResultsFromRepositories(
            [
                DebateArgument::getElasticsearchTypeName() => $this->debateArgumentRepository,
                DebateAnonymousArgument::getElasticsearchTypeName() => $this->debateAnonymousArgumentRepository,
            ],
            $response
        );

        $informations = array_map(
            static fn (Result $result) => [
                'id' => $result->getDocument()->get('id'),
                'objectType' => $result->getDocument()->get('objectType'),
                'geoip' => $result->getDocument()->has('geoip')
                    ? $result->getDocument()->get('geoip')
                    : null,
            ],
            $response->getResults()
        );
        $this->addGeoIpData($hydratedResults, $informations);

        return new ElasticsearchPaginatedResult(
            $hydratedResults,
            $cursors,
            $response->getTotalHits()
        );
    }

    private static function createDebateArgumentsFilteredQuery(
        Debate $debate,
        ?array $filters
    ): BoolQuery {
        $boolQuery = new BoolQuery();
        $boolQuery->addFilter(
            new Query\Terms('objectType', ['debateArgument', 'debateAnonymousArgument'])
        );
        $boolQuery->addFilter(new Term(['debate.id' => $debate->getId()]));
        if ($filters) {
            if (isset($filters['isPublished'])) {
                $boolQuery->addFilter(new Term(['published' => $filters['isPublished']]));
            }
            if (isset($filters['isTrashed'])) {
                $boolQuery->addFilter(new Term(['trashed' => $filters['isTrashed']]));
            }
            if (isset($filters['value'])) {
                $boolQuery->addFilter(new Term(['voteType' => $filters['value']]));
            }
        }

        return $boolQuery;
    }

    private static function createUserArgumentsFilteredQuery(User $author): BoolQuery
    {
        $boolQuery = new BoolQuery();
        $boolQuery->addFilter(new Term(['objectType' => 'debateArgument']));
        $boolQuery->addFilter(new Term(['author.id' => $author->getId()]));
        $boolQuery->addFilter(new Term(['published' => true]));
        $boolQuery->addFilter(new Term(['trashed' => false]));

        return $boolQuery;
    }
}
