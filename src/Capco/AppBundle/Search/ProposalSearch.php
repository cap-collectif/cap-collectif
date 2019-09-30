<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Elastica\Index;
use Elastica\Query;
use Elastica\Result;
use Elastica\Query\Term;
use Elastica\Query\Exists;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\ProposalTrashedStatus;
use Capco\AppBundle\Repository\ProposalRepository;

class ProposalSearch extends Search
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

    private $proposalRepo;

    public function __construct(Index $index, ProposalRepository $proposalRepo)
    {
        parent::__construct($index);
        $this->proposalRepo = $proposalRepo;
        $this->type = 'proposal';
    }

    public function searchProposals(
        int $limit,
        $terms,
        array $providedFilters,
        int $seed,
        ?int $offset,
        ?string $cursor,
        ?string $order = null
    ): array {
        $boolQuery = new Query\BoolQuery();
        $boolQuery = $this->searchTermsInMultipleFields(
            $boolQuery,
            self::SEARCH_FIELDS,
            $terms,
            'phrase_prefix'
        );

        $filters = $this->getFilters($providedFilters);
        foreach ($filters as $key => $value) {
            $boolQuery->addMust(new Term([$key => ['value' => $value]]));
        }
        $boolQuery->addMust(new Exists('id'));

        if ('random' === $order) {
            $query = $this->getRandomSortedQuery($boolQuery, $seed);
            $query->setFrom($offset);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query->setSort(
                    $this->getSort(
                        $order,
                        $providedFilters['collectStep'] ?? $providedFilters['selectionStep']
                    )
                );
            }
            if ($cursor) {
                $query->setParam('search_after', ElasticsearchPaginator::decodeCursor($cursor));
            }
        }

        $query->setSource(['id'])->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);
        $ids = [];
        $cursors = [];
        foreach ($resultSet as $result) {
            $ids[] = $result->getData()['id'];
            $cursors[] = $result->getParam('sort');
        }
        $proposals = $this->getHydratedResults($this->proposalRepo, $ids);

        return [
            'cursors' => $cursors,
            'proposals' => $proposals,
            'count' => $resultSet->getTotalHits()
        ];
    }

    public static function findOrderFromFieldAndDirection(string $field, string $direction): string
    {
        $order = 'random';
        switch ($field) {
            case 'VOTES':
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-votes';
                } else {
                    $order = 'votes';
                }

                break;
            case 'PUBLISHED_AT':
                if (OrderDirection::ASC === $direction) {
                    $order = 'old';
                } else {
                    $order = 'last';
                }

                break;
            case 'COMMENTS':
                $order = 'comments';

                break;
            case 'COST':
                if (OrderDirection::ASC === $direction) {
                    $order = 'cheap';
                } else {
                    $order = 'expensive';
                }

                break;
        }

        return $order;
    }

    public function searchProposalsVotesCount(array $ids): array
    {
        $idsQuery = new Query\Ids();
        $idsQuery->setIds($ids);
        $query = new Query($idsQuery);
        $query->setSource(['id', 'votesCountByStep', 'votesCount'])->setSize(\count($ids));
        $resultSet = $this->index->getType($this->type)->search($query);

        return array_map(static function (Result $result) {
            return $result->getData();
        }, $resultSet->getResults());
    }

    private function getSort(string $order, string $stepId): array
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
            case 'votes':
                return [
                    'votesCountByStep.count' => [
                        'order' => 'desc',
                        'nested_path' => 'votesCountByStep',
                        'nested_filter' => ['term' => ['votesCountByStep.step.id' => $stepId]]
                    ],
                    'createdAt' => ['order' => 'desc']
                ];

            case 'least-votes':
                return [
                    'votesCountByStep.count' => [
                        'order' => 'asc',
                        'nested_path' => 'votesCountByStep',
                        'nested_filter' => ['term' => ['votesCountByStep.step.id' => $stepId]]
                    ],
                    'createdAt' => ['order' => 'desc']
                ];

            case 'comments':
                return [
                    'commentsCount' => ['order' => 'desc'],
                    'createdAt' => ['order' => 'desc']
                ];

            case 'expensive':
                return [
                    'estimation' => ['order' => 'desc'],
                    'createdAt' => ['order' => 'desc']
                ];
            case 'cheap':
                return [
                    'estimation' => ['order' => 'asc'],
                    'createdAt' => ['order' => 'desc']
                ];
            default:
                throw new \RuntimeException('Unknown order: ' . $order);
        }

        return [$sortField => ['order' => $sortOrder]];
    }

    private function getFilters(array $providedFilters): array
    {
        $filters = [];
        $filters['draft'] = false;
        $filters['published'] = true;

        if (isset($providedFilters['trashedStatus'])) {
            if (ProposalTrashedStatus::TRASHED === $providedFilters['trashedStatus']) {
                $filters['trashed'] = true;
            } elseif (ProposalTrashedStatus::NOT_TRASHED === $providedFilters['trashedStatus']) {
                $filters['trashed'] = false;
            }
        }

        if (isset($providedFilters['selectionStep'])) {
            $filters['selections.step.id'] = $providedFilters['selectionStep'];
            if (isset($providedFilters['statuses'])) {
                $filters['selections.status.id'] = $providedFilters['statuses'];
            }
        } elseif (isset($providedFilters['statuses'])) {
            $filters['status.id'] = $providedFilters['statuses'];
        }

        if (isset($providedFilters['proposalForm'])) {
            $filters['proposalForm.id'] = $providedFilters['proposalForm'];
        }

        if (isset($providedFilters['districts'])) {
            $filters['district.id'] = $providedFilters['districts'];
        }
        if (isset($providedFilters['themes'])) {
            $filters['theme.id'] = $providedFilters['themes'];
        }
        if (isset($providedFilters['types']) && $providedFilters['types'] > 0) {
            $filters['author.userType.id'] = $providedFilters['types'];
        }
        if (isset($providedFilters['categories'])) {
            $filters['category.id'] = $providedFilters['categories'];
        }
        if (isset($providedFilters['author'])) {
            $filters['author.id'] = $providedFilters['author'];
        }
        if (isset($providedFilters['published'])) {
            $filters['published'] = $providedFilters['published'];
        }
        if (isset($providedFilters['includeDraft']) && true === $providedFilters['includeDraft']) {
            unset($filters['draft'], $filters['published']);
        }

        return $filters;
    }
}
