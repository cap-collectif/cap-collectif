<?php

namespace Capco\AdminBundle\Resolver;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManager;

class RecentReportingResolver
{
    protected $em;
    protected $toggleManager;

    public function __construct(EntityManager $em, Manager $toggleManager)
    {
        $this->em = $em;
        $this->toggleManager = $toggleManager;
    }

    public function getRecentReports()
    {
        $reports = $this->em
            ->getRepository('CapcoAppBundle:Reporting')
            ->getRecentOrdered();

        return $reports;
    }
}
