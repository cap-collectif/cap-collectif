<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProposalRepository;
use Elastica\Index;
use Elastica\Query;
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

    public function searchProposals(int $page, int $pagination = null, string $order = null, $terms, array $providedFilters): array
    {
        $boolQuery = new Query\BoolQuery();
        $boolQuery = $this->searchTermsInMultipleFields($boolQuery, self::SEARCH_FIELDS, $terms, 'phrase_prefix');

        $filters = $this->getFilters($providedFilters);
        foreach ($filters as $key => $value) {
            $boolQuery->addMust(new Term([
                $key => ['value' => $value],
            ]));
        }

        if ('random' === $order) {
            $query = $this->getRandomSortedQuery($boolQuery);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query->setSort($this->getSort($order, $providedFilters));
            }
        }

        $pagination = $pagination ?? self::RESULTS_PER_PAGE;
        $from = ($page - 1) * $pagination;

        $query
            ->setSource(['id'])
            ->setFrom($from)
            ->setSize($pagination)
        ;

        $resultSet = $this->index->getType($this->type)->search($query);

        return [
            'proposals' => $this->getHydratedResults($resultSet->getResults()),
            'count' => $resultSet->getTotalHits(),
            'order' => $order,
        ];
    }

    private function getHydratedResults(array $results): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        return array_values(array_filter(array_map(function (Result $result) {
            return $this->proposalRepo->findOneBy(['id' => $result->getData()['id'], 'deletedAt' => null]);
        }, $results), function (?Proposal $proposal) {return null !== $proposal; }));
    }

    private function getSort(string $order, array $filters): array
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
              $stepId = $filters['collectStep'] ?? $filters['selectionStep'];
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
              throw new \RuntimeException('Unknow order: ' . $order);
              break;
      }

        return [
          $sortField => ['order' => $sortOrder],
      ];
    }

    private function getFilters(array $providedFilters): array
    {
        $filters = [];

        // Trashed proposals are indexed
        // but most of the time we don't want to see them
        $filters['isTrashed'] = false;

        if (array_key_exists('selectionStep', $providedFilters)) {
            $filters['selections.step.id'] = $providedFilters['selectionStep'];
            if (array_key_exists('statuses', $providedFilters) && $providedFilters['statuses']) {
                $filters['selections.status.id'] = $providedFilters['statuses'];
            }
        } else {
            if (array_key_exists('statuses', $providedFilters) && $providedFilters['statuses']) {
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
        if (array_key_exists('types', $providedFilters) && $providedFilters['types'] > 0) {
            $filters['author.userType.id'] = $providedFilters['types'];
        }
        if (isset($providedFilters['categories'])) {
            $filters['category.id'] = $providedFilters['categories'];
        }
        if (array_key_exists('author', $providedFilters)) {
            $filters['author.id'] = $providedFilters['author'];
        }

        return $filters;
    }
}
