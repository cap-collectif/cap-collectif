<?php
namespace Capco\AppBundle\Search;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProposalRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\Result;

class ProposalSearch extends Search
{
    const SEARCH_FIELDS = [
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
        string $seed
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

        return [
            'proposals' => $this->getHydratedResults(
                array_map(function (Result $result) {
                    return $result->getData()['id'];
                }, $resultSet->getResults())
            ),
            'count' => $resultSet->getTotalHits(),
            'order' => $order,
        ];
    }

    public function getHydratedResults(array $ids): array
    {
        // We can't use findById because we would lost the correct order of ids
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        return array_values(
            array_filter(
                array_map(function (string $id) {
                    return $this->proposalRepo->findOneBy(['id' => $id, 'deletedAt' => null]);
                }, $ids),
                function (?Proposal $proposal) {
                    return null !== $proposal;
                }
            )
        );
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
                throw new \RuntimeException('Unknow order: ' . $order);
                break;
        }

        return [$sortField => ['order' => $sortOrder]];
    }

    private function getFilters(array $providedFilters): array
    {
        $filters = [];

        // Trashed proposals are indexed
        // but most of the time we don't want to see them
        $filters['trashed'] = false;

        if (isset($providedFilters['selectionStep'])) {
            $filters['selections.step.id'] = $providedFilters['selectionStep'];
            if (isset($providedFilters['statuses'])) {
                $filters['selections.status.id'] = $providedFilters['statuses'];
            }
        } else {
            if (isset($providedFilters['statuses'])) {
                $filters['status.id'] = $providedFilters['statuses'];
            }
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

        return $filters;
    }
}
