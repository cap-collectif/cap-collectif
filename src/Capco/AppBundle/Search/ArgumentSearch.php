<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;
use Elastica\ResultSet;

class ArgumentSearch extends Search
{
    private readonly ArgumentRepository $argumentRepository;

    public function __construct(Index $index, ArgumentRepository $argumentRepository)
    {
        parent::__construct($index);
        $this->type = 'argument';
        $this->argumentRepository = $argumentRepository;
    }

    public function getArgumentsByUserIds(?User $viewer, array $keys): array
    {
        $client = $this->index->getClient();
        $globalQuery = new \Elastica\Multi\Search($client);

        foreach ($keys as $key) {
            $boolQuery = new BoolQuery();
            $boolQuery->addFilter(
                new Query\Term(['author.id' => ['value' => $key['user']->getId()]])
            );

            list(
                $cursor,
                $field,
                $direction,
                $limit,
                $includeUnpublished,
                $includeTrashed,
                $aclDisabled) = [
                    $key['args']->offsetGet('after'),
                    $key['args']->offsetGet('orderBy')['field'] ?? 'createdAt',
                    $key['args']->offsetGet('orderBy')['direction'] ?? 'DESC',
                    $key['args']->offsetGet('first'),
                    $key['args']->offsetGet('includeUnpublished') ?? false,
                    $key['args']->offsetGet('includeTrashed') ?? false,
                    $key['args']->offsetGet('aclDisabled') ?? false,
                ];

            if (!$aclDisabled) {
                $this->getFiltersForProjectViewerCanSee('project', $viewer);
            }

            $boolQuery
                ->addMustNot(new Query\Term(['published' => ['value' => false]]))
                ->addMustNot(new Query\Exists('comment'))
                ->addMustNot(new Query\Term(['draft' => ['value' => true]]))
            ;

            if (!$includeTrashed) {
                $boolQuery->addMustNot(new Query\Exists('trashedAt'));
            }

            if (!$includeUnpublished) {
                $boolQuery->addFilter(new Term(['published' => ['value' => true]]));
            }

            $query = new Query($boolQuery);
            $query->setTrackTotalHits(true);

            $order = [
                $this->getSortField($field) => ['order' => $direction],
            ];
            $this->setSortWithId($query, $order);

            self::applyLimit($query, $limit);

            $this->applyCursor($query, $cursor);
            $this->addObjectTypeFilter($query, $this->type);
            $searchQuery = $this->index->createSearch($query);
            $globalQuery->addSearch($searchQuery);
        }

        $responses = $globalQuery->search();
        $results = [];
        $resultSets = $responses->getResultSets();
        foreach ($resultSets as $key => $resultSet) {
            $results[] = $this->getData($this->getCursors($resultSet), $resultSet);
        }

        return $results;
    }

    public function searchArguments(
        Argumentable $argumentable,
        int $limit,
        ?array $orderBy,
        ?array $filters,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $query = new Query(self::createFilteredQuery($argumentable, $filters));
        $this->addObjectTypeFilter($query, $this->type);
        $this->sortQuery($query, $orderBy);
        self::applyLimit($query, $limit);
        $this->applyCursor($query, $cursor);

        $response = $this->index->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    private function getData(array $cursors, ResultSet $response): ElasticsearchPaginatedResult
    {
        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->argumentRepository, $response),
            $cursors,
            $response->getTotalHits()
        );
    }

    private function sortQuery(Query $query, ?array $orderBy): Query
    {
        if ($orderBy) {
            $this->setSortWithId($query, [
                $orderBy['field'] => ['order' => $orderBy['direction']],
            ]);
        }

        return $query;
    }

    private static function getSortField(?string $field): string
    {
        if (null === $field) {
            return 'createdAt';
        }

        switch ($field) {
            case 'PUBLISHED_AT':
                return 'publishedAt';

            default:
                return 'createdAt';
        }
    }

    private static function applyLimit(Query $query, int $limit): Query
    {
        return $query->setSize($limit + 1);
    }

    private static function createFilteredQuery(
        Argumentable $argumentable,
        ?array $filters
    ): BoolQuery {
        $boolQuery = new BoolQuery();
        $boolQuery->addFilter(new Term(['objectType' => 'argument']));
        $boolQuery->addFilter(self::getArgumentableFilter($argumentable));

        if ($filters) {
            if (isset($filters['isTrashed'])) {
                $boolQuery->addFilter(new Term(['trashed' => $filters['isTrashed']]));
            }
            if (isset($filters['voteType'])) {
                $boolQuery->addFilter(new Term(['voteType' => $filters['voteType']]));
            }
        }

        return $boolQuery;
    }

    private static function getArgumentableFilter(Argumentable $argumentable): Term
    {
        return new Term([
            self::getArgumentableType($argumentable) . '.id' => $argumentable->getId(),
        ]);
    }

    private static function getArgumentableType(Argumentable $argumentable): string
    {
        if ($argumentable instanceof Opinion) {
            return 'opinion';
        }
        if ($argumentable instanceof OpinionVersion) {
            return 'opinionVersion';
        }

        throw new \Exception('unknown argumentable type of entity ' . $argumentable->getId());
    }
}
