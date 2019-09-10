<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Enum\OpinionOrderField;
use Elastica\Index;
use Elastica\Query;
use Elastica\Result;
use Elastica\Query\Term;
use Elastica\Query\Exists;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Repository\OpinionRepository;

/**
 * TODO: Not used yet.
 */
class OpinionSearch extends Search
{
    public const SEARCH_FIELDS = ['title', 'title.std', 'body', 'body.std'];

    private $opinionRepo;

    public function __construct(Index $index, OpinionRepository $opinionRepo)
    {
        parent::__construct($index);
        $this->opinionRepo = $opinionRepo;
        $this->type = 'opinion';
    }

    public function getByCriteriaOrdered($filters, $order, $limit = 50, $offset = 0, int $seed = 123): array
    {
        $boolQuery = new Query\BoolQuery();
//        $filters = $this->getFilters(['type' => $sectionId]);

//        foreach ($filters as $key => $value) {
//            if ($value) {
//                $boolQuery->addMust(new Term([$key => ['value' => $value]]));
//            }
//        }
        $boolQuery->addMust(new Exists('id'));

        if ('random' === $order) {
            $query = $this->getRandomSortedQuery($boolQuery, $seed);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query->setSort($this->getSort($order));
            }
        }
        $query
            ->setSource(['id', 'argumentsCount'])
            ->setFrom($offset)
            ->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);

        $ids = array_map(function (Result $result) {
            return $result->getData()['id'];
        }, $resultSet->getResults());
        $opinions = $this->getHydratedResults($this->opinionRepo, $ids);

        return [
            'opinions' => $opinions,
            'count' => $resultSet->getTotalHits()
        ];
    }

    /**
     * TODO: Not used yet.
     */
    public function searchBySection(
        int $offset,
        int $limit,
        string $sectionId,
        string $order = null,
        int $seed
    ): array {
        $boolQuery = new Query\BoolQuery();
        $filters = $this->getFilters(['type' => $sectionId]);

        foreach ($filters as $key => $value) {
            if ($value) {
                $boolQuery->addMust(new Term([$key => ['value' => $value]]));
            }
        }
        $boolQuery->addMust(new Exists('id'));

        if ('random' === $order) {
            $query = $this->getRandomSortedQuery($boolQuery, $seed);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query->setSort($this->getSort($order));
            }
        }
        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);

        $ids = array_map(function (Result $result) {
            return $result->getData()['id'];
        }, $resultSet->getResults());
        $opinions = $this->getHydratedResults($this->opinionRepo, $ids);

        return [
            'opinions' => $opinions,
            'count' => $resultSet->getTotalHits()
        ];
    }

    public static function findOrderFromFieldAndDirection(string $field, string $direction): string
    {
        $order = 'random';
        switch ($field) {
            case OpinionOrderField::PUBLISHED_AT:
                if (OrderDirection::ASC === $direction) {
                    $order = 'old-published';
                } else {
                    $order = 'last-published';
                }
                break;
            case OpinionOrderField::COMMENTS:
                $order = 'comments';
                break;
            case OpinionOrderField::VOTES:
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-voted';
                } else {
                    $order = 'voted';
                }
                break;
            case OpinionOrderField::POPULAR:
            case OpinionOrderField::VOTES_OK:
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-popular';
                } else {
                    $order = 'popular';
                }
                break;
            case OpinionOrderField::POSITIONS:
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-position';
                } else {
                    $order = 'position';
                }
                break;
        }

        return $order;
    }

    private function getSort(string $order): array
    {
        switch ($order) {
            case 'old-published':
                $sortField = 'publishedAt';
                $sortOrder = 'asc';
                break;
            case 'last-published':
                $sortField = 'publishedAt';
                $sortOrder = 'desc';
                break;
            case 'comments':
                return [
                    'commentsCount' => ['order' => 'desc'],
                    'createdAt' => ['order' => 'desc']
                ];
            case 'least-popular':
                return [
                    'votesCountNok' => ['order' => 'DESC'],
                    'votesCountOk' => ['order' => 'ASC'],
                    'createdAt' => ['order' => 'DESC']
                ];
            case 'least-voted':
                $sortField = 'vnb';
                $sortOrder = 'asc';
                break;
            case 'least-position':
                $sortField = 'position';
                $sortOrder = 'desc';
                break;
            case 'popular':
                return [
                    'votesCountOk' => ['order' => 'DESC'],
                    'votesCountNok' => ['order' => 'ASC'],
                    'createdAt' => ['order' => 'DESC']
                ];
            case 'voted':
                $sortField = 'vnb';
                $sortOrder = 'desc';
                break;
            case 'position':
                $sortField = 'position';
                $sortOrder = 'desc';
                break;
            default:
                throw new \RuntimeException('Unknown order: ' . $order);

                break;
        }

        return [$sortField => ['order' => $sortOrder]];
    }

    private function getFilters(array $providedFilters): array
    {
        $filters = [];
        $filters['trashed'] = false;

        if (isset($providedFilters['trashed'])){
            $filters['trashed'] = $providedFilters['type'];
        }

        if (isset($providedFilters['step'])){
            $filters['step'] = $providedFilters['step'];
        }

        if (isset($providedFilters['section'])){
            $filters['section'] = $providedFilters['section'];
        }




        if (isset($providedFilters['type'])) {
            $filters['type.id'] = $providedFilters['type'];
        }

        return $filters;
    }
}
