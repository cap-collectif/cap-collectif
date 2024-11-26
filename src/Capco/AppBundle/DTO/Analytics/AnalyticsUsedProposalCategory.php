<?php

namespace Capco\AppBundle\DTO\Analytics;

use Capco\AppBundle\Entity\ProposalCategory;

class AnalyticsUsedProposalCategory
{
    private readonly ProposalCategory $category;
    private readonly int $totalCount;

    public function __construct(ProposalCategory $category, int $totalCount)
    {
        $this->category = $category;
        $this->totalCount = $totalCount;
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
