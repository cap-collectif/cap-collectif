<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Enum\ContributionOrderField;
use Capco\AppBundle\Enum\OpinionOrderField;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;
use Elastica\Query\Exists;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;

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

    public function getByCriteriaOrdered(
        $filters,
        $order,
        $limit = 50,
        $offset = 0,
        User $viewer = null,
        int $seed = 91243
    ): array {
        $boolQuery = new BoolQuery();
        $conditions = [];

        if ($viewer && !$viewer->isSuperAdmin()) {
            $conditions[] = (new BoolQuery())->addShould(
                $this->getFiltersForProjectViewerCanSee('project', $viewer)
            );
        }

        if (!$viewer) {
            $conditions[] = new Term([
                'project.visibility' => [
                    'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                ]
            ]);
        }

        if (isset($filters['trashed']) && !$filters['trashed']) {
            $boolQuery->addMustNot(new Exists('trashedAt'));
            unset($filters['trashed']);
        }
        foreach ($filters as $key => $value) {
            $conditions[] = new Term([$key => ['value' => $value]]);
        }

        $boolQuery->addMust($conditions);

        if (ContributionOrderField::RANDOM === $order) {
            $query = $this->getRandomSortedQuery($boolQuery, $seed);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query->setSort(
                    array_merge(['pinned' => ['order' => 'desc']], $this->getSort($order))
                );
            }
        }

        $query->setFrom($offset)->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);

        return [
            'opinions' => $this->getHydratedResultsFromResultSet($this->opinionRepo, $resultSet),
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

        return [
            'opinions' => $this->getHydratedResultsFromResultSet($this->opinionRepo, $resultSet),
            'count' => $resultSet->getTotalHits()
        ];
    }

    public static function findOrderFromFieldAndDirection(string $field, string $direction): string
    {
        $order = OpinionOrderField::RANDOM;
        switch ($field) {
            case OpinionOrderField::CREATED_AT:
                if (OrderDirection::ASC === $direction) {
                    $order = 'old';
                } else {
                    $order = 'last';
                }

                break;
            case OpinionOrderField::PUBLISHED_AT:
                if (OrderDirection::ASC === $direction) {
                    $order = 'old-published';
                } else {
                    $order = 'last-published';
                }

                break;
            case ContributionOrderField::COMMENT_COUNT:
            case OpinionOrderField::COMMENTS:
                $order = 'comments';

                break;
            case ContributionOrderField::VOTE_COUNT:
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
            case OpinionOrderField::POSITION:
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
            case 'old':
                $sortField = 'createdAt';
                $sortOrder = 'asc';

                break;
            case 'last':
                $sortField = 'createdAt';
                $sortOrder = 'desc';

                break;
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
                $sortField = 'votesCount';
                $sortOrder = 'asc';

                break;
            case 'position':
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
                $sortField = 'votesCount';
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

        $filters['trashed'] = $providedFilters['trashed'] ?? false;

        if (isset($providedFilters['step'])) {
            $filters['step.id'] = $providedFilters['step'];
        }

        if (isset($providedFilters['section'])) {
            $filters['type.id'] = $providedFilters['type'];
        }

        return $filters;
    }
}
