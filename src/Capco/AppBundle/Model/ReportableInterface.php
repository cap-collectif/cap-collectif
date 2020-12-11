<?php

namespace Capco\AppBundle\Model;

use Capco\AppBundle\Entity\Reporting;

interface ReportableInterface extends ModerableInterface
{
    public function getReports(): iterable;

    public function addReport(Reporting $report);

    public function removeReport(Reporting $report);
}
