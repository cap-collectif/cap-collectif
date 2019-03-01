<?php

namespace Capco\AppBundle\Search;

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
        'teaser.std',
    ];
    private const POPULAR = 'POPULAR';
    private const LATEST = 'LATEST';

    private $projectRepo;

    public function __construct(Index $index, ProjectRepository $projectRepo)
    {
        parent::__construct($index);
        $this->projectRepo = $projectRepo;
        $this->type = 'project';
    }

    public function searchProjects(
        int $offset,
        ?int $limit,
        array $order = null,
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

        if (isset($providedFilters['withEventOnly'])) {
            $withEventOnlyBoolQuery = new Query\BoolQuery();
            $withEventOnlyBoolQuery->addShould(new Query\Range('eventCount', ['gt' => 0]));
            $boolQuery->addMust($withEventOnlyBoolQuery);
            unset($providedFilters['withEventOnly']);
        }

        foreach ($providedFilters as $key => $value) {
            $boolQuery->addMust(new Term([$key => ['value' => $value]]));
        }
        $boolQuery->addMust(new Exists('id'));

        $query = new Query($boolQuery);

        if (isset($order['field'])) {
            $query->setSort($this->getSort($order['field']));
        }

        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit);

        $resultSet = $this->index->getType($this->type)->search($query);
        $results = $this->getHydratedResults(
            array_map(function (Result $result) {
                return $result->getData()['id'];
            }, $resultSet->getResults())
        );

        return [
            'projects' => $results,
            'count' => $resultSet->getTotalHits(),
            'order' => $order,
        ];
    }

    public function getAllContributions(): int
    {
        $query = new Query();
        $resultSet = $this->index
            ->getType($this->type)
            ->search($query, $this->projectRepo->count([]));

        $totalCount = array_sum(
            array_map(function (Result $result) {
                return $result->getHit()['_source']['contributionsCount'];
            }, $resultSet->getResults())
        );

        return $totalCount ?: 0;
    }

    private function getHydratedResults(array $ids): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        $projects = $this->projectRepo->hydrateFromIds($ids);
        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($projects, function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return $projects;
    }

    private function getSort(string $order): array
    {
        switch ($order) {
            case self::POPULAR:
                $sortField = 'contributionsCount';
                $sortOrder = 'desc';

                break;
            case self::LATEST:
                $sortField = 'publishedAt';
                $sortOrder = 'desc';

                break;
            default:
                throw new \RuntimeException("Unknow order: ${order}");

                break;
        }

        return [$sortField => ['order' => $sortOrder]];
    }
}
