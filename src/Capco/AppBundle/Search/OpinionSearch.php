<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Enum\ContributionOrderField;
use Capco\AppBundle\Enum\OpinionOrderField;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Exists;
use Elastica\Query\Term;

class OpinionSearch extends Search
{
    final public const SEARCH_FIELDS = ['title', 'title.std', 'body', 'body.std'];

    public function __construct(
        Index $index,
        private readonly OpinionRepository $opinionRepo
    ) {
        parent::__construct($index);
        $this->type = 'opinion';
    }

    public function getByCriteriaOrdered(
        $filters,
        $order,
        $limit = 50,
        ?string $cursor = null,
        ?User $viewer = null,
        // Wtf seed en dur ?
        int $seed = 91243
    ): ElasticsearchPaginatedResult {
        $boolQuery = new BoolQuery();
        $conditions = [];

        if ($viewer && !$viewer->isSuperAdmin()) {
            $subBoolQuery = new BoolQuery();
            $visibilityFilters = $this->getFiltersForProjectViewerCanSee('project', $viewer);

            if ($viewer->getOrganization()) {
                $organizationFilter = (new BoolQuery())->addShould(
                    new Term([
                        'consultation.owner.id' => [
                            'value' => $viewer->getOrganization()->getId(),
                        ],
                    ])
                );
                $visibilityFilters[] = $organizationFilter;
            }

            foreach ($visibilityFilters as $filter) {
                $subBoolQuery->addShould($filter);
            }

            $conditions[] = $subBoolQuery;
        }

        if (!$viewer) {
            $conditions[] = new Term([
                'project.visibility' => [
                    'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC,
                ],
            ]);
        }

        $this->filterTrashed($filters, $boolQuery);
        foreach ($filters as $key => $value) {
            $conditions[] = new Term([$key => ['value' => $value]]);
        }

        foreach ($conditions as $condition) {
            $boolQuery->addFilter($condition);
        }
        if (ContributionOrderField::RANDOM === $order) {
            $query = $this->getRandomSortedQuery($boolQuery, $seed);
            $query->setSort(['_score' => new \stdClass(), 'id' => new \stdClass()]);
        } elseif ('least-position' === $order) {
            $query = $this->getOrderedThenRandomQuery($boolQuery, $seed);
            $query->setSort(['_score' => new \stdClass(), 'id' => new \stdClass()]);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query
                    ->addSort(['pinned' => ['order' => 'desc']])
                    ->addSort($this->getSort($order))
                    ->addSort(['id' => new \stdClass()])
                ;
            }
        }
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $response = $this->index->search($query);
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
        ?string $order,
        int $seed
    ): array {
        $boolQuery = new Query\BoolQuery();
        $filters = $this->getFilters(['type' => $sectionId]);

        foreach ($filters as $key => $value) {
            if ($value) {
                $boolQuery->addFilter(new Term([$key => ['value' => $value]]));
            }
        }
        $boolQuery->addFilter(new Exists('id'));

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
            ->setSize($limit)
        ;
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);

        return [
            'opinions' => $this->getHydratedResultsFromResultSet($this->opinionRepo, $resultSet),
            'count' => $resultSet->getTotalHits(),
        ];
    }

    public function getOrderedThenRandomQuery(Query\AbstractQuery $query, int $seed): Query
    {
        $functionScore = new Query\FunctionScore();
        $functionScore
            ->setBoostMode(Query\FunctionScore::BOOST_MODE_MAX)
            ->setScoreMode(Query\FunctionScore::SCORE_MODE_SUM)
        ;

        $functionScore
            ->addFieldValueFactorFunction(
                'position',
                1,
                Query\FunctionScore::FIELD_VALUE_FACTOR_MODIFIER_RECIPROCAL,
                Search::BIG_INT_VALUE,
                50,
                new Term(['pinned' => true])
            )
            ->addFunction('filter', [], new Term(['pinned' => true]), 35)
            ->addRandomScoreFunction($seed, new Term(['pinned' => false]), 20)
        ;

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

    private function getFilters(array $providedFilters): array
    {
        $filters = [];

        $filters['trashed'] = $providedFilters['trashed'] ?? false;

        if (isset($providedFilters['step'])) {
            $filters['step.id'] = $providedFilters['step'];
        }

        if (isset($providedFilters['project'])) {
            $filters['project.id'] = $providedFilters['project'];
        }

        if (isset($providedFilters['section'])) {
            $filters['type.id'] = $providedFilters['type'];
        }

        return $filters;
    }
}
