<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Enum\ContributionOrderField;
use Capco\AppBundle\Enum\OpinionOrderField;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Exists;
use Elastica\Query\Term;

class VersionSearch extends Search
{
    public const SEARCH_FIELDS = ['title', 'title.std', 'body', 'body.std'];

    private $opinionVersionRepo;

    public function __construct(Index $index, OpinionVersionRepository $opinionVersionRepo)
    {
        parent::__construct($index);
        $this->opinionVersionRepo = $opinionVersionRepo;
        $this->type = 'opinionVersion';
    }

    public function getByCriteriaOrdered(
        array $filters,
        string $order,
        int $limit,
        ?string $cursor = null,
        ?User $viewer = null,
        ?int $seed = null,
        bool $isACLDisabled = false
    ): ElasticsearchPaginatedResult {
        $boolQuery = new BoolQuery();
        if (!$isACLDisabled) {
            if ($viewer && !$viewer->isSuperAdmin()) {
                $subBoolQuery = new BoolQuery();
                $projectViewerCanSeeFilters = $this->getFiltersForProjectViewerCanSee(
                    'project',
                    $viewer
                );
                foreach ($projectViewerCanSeeFilters as $filter) {
                    $subBoolQuery->addShould($filter);
                }
                $boolQuery->addFilter($subBoolQuery);
            }

            if (!$viewer) {
                $boolQuery->addFilter(
                    new Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC,
                        ],
                    ])
                );
            }
        }

        if (isset($filters['trashed']) && !$filters['trashed']) {
            $boolQuery->addMustNot(new Exists('trashedAt'));
            unset($filters['trashed']);
        } else {
            unset($filters['trashed']);
        }
        foreach ($filters as $key => $value) {
            $boolQuery->addFilter(new Term([$key => ['value' => $value]]));
        }

        if (ContributionOrderField::RANDOM === $order) {
            $query = $this->getRandomSortedQuery($boolQuery, $seed);
            $query->setSort(['_score' => new \stdClass(), 'id' => new \stdClass()]);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query->addSort($this->getSort($order))->addSort(['id' => new \stdClass()]);
            }
        }

        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $response = $this->index->search($query);

        $cursors = $this->getCursors($response);

        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->opinionVersionRepo, $response),
            $cursors,
            $response->getTotalHits()
        );
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
}
