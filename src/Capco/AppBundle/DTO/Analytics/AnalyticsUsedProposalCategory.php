<?php

namespace Capco\AppBundle\DTO\Analytics;

use Capco\AppBundle\Entity\ProposalCategory;

class AnalyticsUsedProposalCategory
{
    private ProposalCategory $category;
    private int $totalCount;

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
