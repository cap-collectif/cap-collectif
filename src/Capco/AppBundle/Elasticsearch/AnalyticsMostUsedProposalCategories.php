<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\DTO\Analytics\AnalyticsUsedProposalCategory;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Elastica\ResultSet;

class AnalyticsMostUsedProposalCategories
{
    private ProposalCategoryRepository $repository;
    private iterable $values = [];
    private int $totalCount = 0;

    public function __construct(ProposalCategoryRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getTotalCount(): int
    {
        return $this->totalCount;
    }

    public function getValues(): iterable
    {
        return $this->values;
    }

    public function fromEs(ResultSet $set): self
    {
        $categories = array_map(
            static fn (array $bucket) => [
                'id' => $bucket['key'],
                'doc_count' => $bucket['doc_count'],
            ],
            $set->getAggregation('most_used_proposal_categories')['buckets']
        );
        $this->totalCount = array_reduce(
            $categories,
            static fn (int $acc, array $category) => $acc + $category['doc_count'],
            0
        );
        $ids = array_map(static fn (array $category) => $category['id'], $categories);
        $categoriesFromDb = $this->repository->hydrateFromIdsOrdered($ids);

        $this->values = array_map(
            static function (array $category, int $i) use ($categoriesFromDb) {
                return new AnalyticsUsedProposalCategory(
                    $categoriesFromDb[$i],
                    $category['doc_count']
                );
            },
            $categories,
            array_keys($categories)
        );

        return $this;
    }
}
