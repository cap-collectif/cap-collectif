<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticaToDoctrineTransformer;
use Elastica\Index;
use Elastica\Query;
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

    public function __construct(Index $index, ElasticaToDoctrineTransformer $transformer, $validator)
    {
        parent::__construct($index, $transformer, $validator);

        $this->type = 'proposal';
    }

    public function searchProposalsIn(array $selectedIds, string $selectedStepId = null): array
    {
        $query = new Query\BoolQuery();

        $query = $this->searchTermsInField($query, 'id', $selectedIds);

        if (null !== $selectedStepId) {
            $query = $this->searchTermsInField($query, 'selections.step.id', $selectedStepId);
        }

        $results = $this->getResults($query, count($selectedIds), false);

        return [
            'proposals' => array_map(function (Result $result) {
                return $result->getSource();
            }, $results['results']),
            'count' => $results['count'],
        ];
    }

    public function searchProposals($page, int $pagination = null, $order, $terms, $providedFilters): array
    {
        $pagination = $pagination ?? self::RESULTS_PER_PAGE;

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
                $stepId = $providedFilters['step'] ?? $providedFilters['selectionStep'];
                $sortField = 'votesCountByStepId.' . $stepId;
                $sortOrder = 'desc';
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
                $sortField = '_score';
                $sortOrder = 'desc';
                break;
        }

        $filters = $this->initFilters($providedFilters);

        $from = ($page - 1) * $pagination;

        $query = new Query\BoolQuery();

        $query = $this->searchTermsInMultipleFields($query, self::SEARCH_FIELDS, $terms, 'phrase_prefix');

        $boolFilter = !empty($filters) ? $this->getBoolFilter($filters) : null;

        if ($boolFilter) {
            $query = new Query\Filtered($query, $boolFilter);
            // TODO when upgrade version of elasticsearch use this line instead (Query\Filtered is deprecated)
            // $query->addFilter($boolFilter);
        }

        if ('random' === $order) {
            $query = $this->getRandomSortedQuery($query);
        } else {
            $query = new Query($query);
        }

        $this->addSort($query, $sortField, $sortOrder);

        $query
            ->setHighlight($this->getHighlightSettings())
            ->setFrom($from)
            ->setSize($pagination);

        $resultSet = $this->index->getType($this->type)->search($query);

        $count = $resultSet->getTotalHits();
        $results = $resultSet->getResults();

        return [
            'proposals' => array_map(function (Result $result) {
                return $result->getSource();
            }, $results),
            'count' => $count,
            'order' => $order,
        ];
    }

    private function getHighlightSettings(): array
    {
        return [
            'pre_tags' => ['<span class="search__highlight">'],
            'post_tags' => ['</span>'],
            'number_of_fragments' => 3,
            'fragment_size' => 175,
            'fields' => [
                'title' => ['number_of_fragments' => 0],
                'object' => new \stdClass(),
                'body' => new \stdClass(),
                'teaser' => new \stdClass(),
                'excerpt' => new \stdClass(),
                'username' => ['number_of_fragments' => 0],
                'biography' => new \stdClass(),
            ],
        ];
    }

    private function initFilters(array $providedFilters): array
    {
        $filters = [];
        $filters['isTrashed'] = false;
        $filters['enabled'] = true;

        if (array_key_exists('selectionStep', $providedFilters)) {
            $filters['selections.step.id'] = $providedFilters['selectionStep'];
        }

        if (isset($providedFilters['proposalForm'])) {
            $filters['proposalForm.id'] = $providedFilters['proposalForm'];
        }
        if (array_key_exists('statuses', $providedFilters) && $providedFilters['statuses']) {
            $filters['status.id'] = $providedFilters['statuses'];
        }
        if (array_key_exists('selectionStatuses', $providedFilters) && $providedFilters['selectionStatuses']) {
            $filters['selections.status.id'] = $providedFilters['selectionStatuses'];
        }
        if (isset($providedFilters['districts'])) {
            $filters['district.id'] = $providedFilters['districts'];
        }
        if (isset($providedFilters['themes'])) {
            $filters['theme.id'] = $providedFilters['themes'];
        }
        if (array_key_exists('types', $providedFilters) && $providedFilters['types'] > 0) {
            $filters['author.userType.id'] = $providedFilters['types'];
        }
        if (isset($providedFilters['categories'])) {
            $filters['category.id'] = $providedFilters['categories'];
        }
        if (array_key_exists('authorUniqueId', $providedFilters)) {
            $filters['author.uniqueId'] = $providedFilters['authorUniqueId'];
        }

        return $filters;
    }
}
