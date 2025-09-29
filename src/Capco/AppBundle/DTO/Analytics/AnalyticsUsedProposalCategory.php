<?php

namespace Capco\AppBundle\DTO\Analytics;

use Capco\AppBundle\Entity\ProposalCategory;

class AnalyticsUsedProposalCategory
{
    public function __construct(
        private readonly ProposalCategory $category,
        private readonly int $totalCount
    ) {
    }

    public function getTotalCount(): int
    {
        return $this->totalCount;
    }

    public function getCategory(): ProposalCategory
    {
        return $this->category;
    }
}
