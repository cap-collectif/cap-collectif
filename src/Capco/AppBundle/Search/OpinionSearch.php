<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
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
    public const BIG_INT_VALUE = 2147483647;

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
        ?string $cursor = null,
        User $viewer = null,
        int $seed = 91243
    ): ElasticsearchPaginatedResult {
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
            $query->setSort(['_score' => new \stdClass(), 'id' => new \stdClass()]);
        } elseif ('least-position' === $order) {
            $query = $this->getOrderedThenRandomQuery($boolQuery, $seed);
            $query->setSort(['_score' => new \stdClass(), 'id' => new \stdClass()]);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query->setSort(
                    array_merge(
                        ['pinned' => ['order' => 'desc'], 'id' => new \stdClass()],
                        $this->getSort($order)
                    )
                );
            }
        }

        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($response);

        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->opinionRepo, $response),
            $cursors,
            $response->getTotalHits()
        );
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

    public function getOrderedThenRandomQuery(Query\AbstractQuery $query, int $seed): Query
    {
        $functionScore = new Query\FunctionScore();
        $functionScore
            ->setBoostMode(Query\FunctionScore::BOOST_MODE_MAX)
            ->setScoreMode(Query\FunctionScore::SCORE_MODE_SUM);

        $functionScore
            ->addFieldValueFactorFunction(
                'position',
                1,
                Query\FunctionScore::FIELD_VALUE_FACTOR_MODIFIER_RECIPROCAL,
                self::BIG_INT_VALUE,
                50,
                new Term(['pinned' => true])
            )
            ->addFunction('filter', [], new Term(['pinned' => true]), 35)
            ->addRandomScoreFunction($seed, new Term(['pinned' => false]), 20);

        $functionScore->setQuery($query);

        return new Query($functionScore);
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
                $sortField = 'position';
                $sortOrder = 'desc';

                break;
            case 'least-position':
                $sortField = 'position';
                $sortOrder = 'asc';

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
