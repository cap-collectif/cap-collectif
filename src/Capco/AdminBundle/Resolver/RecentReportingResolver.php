<?php

namespace Capco\AdminBundle\Resolver;

use Doctrine\ORM\EntityRepository;

class RecentReportingResolver
{
    protected $reportingRepository;

    public function __construct(EntityRepository $reportingRepository)
    {
        $this->reportingRepository = $reportingRepository;
    }

    public function getRecentReports(): array
    {
        $reports = $this->reportingRepository->getRecentOrdered();

        return $reports;
    }
}
