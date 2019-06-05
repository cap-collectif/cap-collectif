<?php

namespace Capco\AppBundle\Search;

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
        'teaser.std',
    ];

    private $proposalRepo;

    public function __construct(Index $index, ProposalRepository $proposalRepo)
    {
        parent::__construct($index);
        $this->proposalRepo = $proposalRepo;
        $this->type = 'proposal';
    }

    public function searchProposals(
        int $offset,
        int $limit,
        string $order = null,
        $terms,
        array $providedFilters,
        int $seed
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
        }
        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);
        $ids = array_map(function (Result $result) {
            return $result->getData()['id'];
        }, $resultSet->getResults());
        $proposals = $this->getHydratedResults($ids);

        return [
            'proposals' => $proposals,
            'count' => $resultSet->getTotalHits(),
        ];
    }

    public function getHydratedResults(array $ids): array
    {
        $proposals = $this->proposalRepo->hydrateFromIds($ids);
        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($proposals, function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return $proposals;
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

        return array_map(function (Result $result) {
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
                        'nested_filter' => ['term' => ['votesCountByStep.step.id' => $stepId]],
                    ],
                ];

                break;
            case 'least-votes':
                return [
                    'votesCountByStep.count' => [
                        'order' => 'asc',
                        'nested_path' => 'votesCountByStep',
                        'nested_filter' => ['term' => ['votesCountByStep.step.id' => $stepId]],
                    ],
                ];

                break;
            case 'comments':
                $sortField = 'commentsCount';
                $sortOrder = 'desc';

                break;
            case 'expensive':
                $sortField = 'estimation';
                $sortOrder = 'desc';

                break;
            case 'cheap':
                $sortField = 'estimation';
                $sortOrder = 'asc';

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
        $filters['isDraft'] = false;
        $filters['isPublished'] = true;

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
        if (isset($providedFilters['isPublished'])) {
            $filters['isPublished'] = $providedFilters['isPublished'];
        }
        if (isset($providedFilters['includeDraft'])) {
            if (true === $providedFilters['includeDraft']) {
                unset($filters['isDraft'], $filters['isPublished']);
            }
        }

        return $filters;
    }
}
