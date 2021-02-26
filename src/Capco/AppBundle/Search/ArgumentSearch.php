<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;

class ArgumentSearch extends Search
{
    private ArgumentRepository $argumentRepository;

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
                $aclDisabled,
            ) = [
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

            $boolQuery->addMustNot(
                array_merge(
                    [
                        new Query\Term(['published' => ['value' => false]]),
                        new Query\Exists('comment'),
                        new Query\Term(['draft' => ['value' => true]]),
                    ],
                    !$includeTrashed ? [new Query\Exists('trashedAt')] : []
                )
            );

            if (!$includeUnpublished) {
                $boolQuery->addFilter(new Term(['published' => ['value' => true]]));
            }

            $query = new Query($boolQuery);
            $query->setTrackTotalHits(true);

            $order = [
                $this->getSortField($field) => ['order' => $direction],
            ];
            $this->setSortWithId($query, $order);

            if ($limit) {
                // + 1 for paginator data
                $query->setSize($limit + 1);
            }

            $this->applyCursor($query, $cursor);
            $this->addObjectTypeFilter($query, $this->type);
            $searchQuery = $this->index->createSearch($query);
            $globalQuery->addSearch($searchQuery);
        }

        $responses = $globalQuery->search();
        $results = [];
        $resultSets = $responses->getResultSets();
        foreach ($resultSets as $key => $resultSet) {
            $results[] = new ElasticsearchPaginatedResult(
                $this->getHydratedResultsFromResultSet($this->argumentRepository, $resultSet),
                $this->getCursors($resultSet),
                $resultSet->getTotalHits()
            );
        }

        return $results;
    }

    private function getSortField(?string $field): string
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
}
