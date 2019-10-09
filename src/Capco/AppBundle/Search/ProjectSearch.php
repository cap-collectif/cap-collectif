<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\ProjectRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\Result;

class ProjectSearch extends Search
{
    public const SEARCH_FIELDS = [
        'title',
        'title.std',
        'reference',
        'reference.std',
        'body',
        'body.std',
        'object',
        'object.std',
        'teaser',
        'teaser.std'
    ];
    private const POPULAR = 'POPULAR';
    private const PUBLISHED_AT = 'PUBLISHED_AT';

    private $projectRepo;

    public function __construct(Index $index, ProjectRepository $projectRepo)
    {
        parent::__construct($index);
        $this->projectRepo = $projectRepo;
        $this->type = 'project';
    }

    public function searchProjects(
        int $offset,
        int $limit,
        array $orderBy,
        string $term = null,
        array $providedFilters
    ): array {
        $boolQuery = new Query\BoolQuery();
        $boolQuery = $this->searchTermsInMultipleFields(
            $boolQuery,
            self::SEARCH_FIELDS,
            $term,
            'phrase_prefix'
        );

        if (
            isset($providedFilters['withEventOnly']) &&
            true === $providedFilters['withEventOnly']
        ) {
            $withEventOnlyBoolQuery = new Query\BoolQuery();
            $withEventOnlyBoolQuery->addShould(new Query\Range('eventCount', ['gt' => 0]));
            $boolQuery->addMust($withEventOnlyBoolQuery);
            unset($providedFilters['withEventOnly']);
        }

        foreach ($providedFilters as $key => $value) {
            if (null !== $value) {
                $boolQuery->addMust(new Term([$key => ['value' => $value]]));
            }
        }

        $boolQuery->addMust(new Exists('id'));

        $query = new Query($boolQuery);

        $query->setSort($this->getSort($orderBy));

        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit);

        $resultSet = $this->index->getType($this->type)->search($query);
        $results = $this->getHydratedResultsFromResultSet($this->projectRepo, $resultSet);

        return [
            'projects' => $results,
            'count' => $resultSet->getTotalHits()
        ];
    }

    public function getAllContributions(): int
    {
        $query = new Query();
        $query->setSource(['contributionsCount', 'visibility']);
        $resultSet = $this->index
            ->getType($this->type)
            ->search($query, $this->projectRepo->count([]));
        $totalCount = array_sum(
            array_map(static function (Result $result) {
                if (ProjectVisibilityMode::VISIBILITY_PUBLIC === $result->getData()['visibility']) {
                    return $result->getData()['contributionsCount'];
                }

                return 0;
            }, $resultSet->getResults())
        );

        return $totalCount;
    }

    private function getSort(array $orderBy): array
    {
        switch ($orderBy['field']) {
            case self::POPULAR:
                return [
                    'contributionsCount' => ['order' => $orderBy['direction']],
                    'createdAt' => ['order' => 'desc']
                ];
            case self::PUBLISHED_AT:
                $sortField = 'publishedAt';
                $sortOrder = $orderBy['direction'];

                break;
            default:
                throw new \RuntimeException("Unknown order: ${orderBy}");
        }

        return [$sortField => ['order' => $sortOrder]];
    }
}
