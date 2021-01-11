<?php

namespace Capco\AppBundle\Search;

use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Term;
use Elastica\Query\Exists;
use Elastica\Query\BoolQuery;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\OpinionOrderField;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Enum\ContributionOrderField;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;

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
        $conditions = [];

        if (!$isACLDisabled) {
            if ($viewer && !$viewer->isSuperAdmin()) {
                $boolQuery
                    ->addFilter(new BoolQuery())
                    ->addShould($this->getFiltersForProjectViewerCanSee('project', $viewer));
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
                    'argumentsCount' => ['order' => 'desc'],
                    'publishedAt' => ['order' => 'desc'],
                ];
            case 'least-popular':
                return [
                    'votesCountNok' => ['order' => 'DESC'],
                    'votesCountOk' => ['order' => 'ASC'],
                    'publishedAt' => ['order' => 'DESC'],
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
                    'publishedAt' => ['order' => 'DESC'],
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
}
