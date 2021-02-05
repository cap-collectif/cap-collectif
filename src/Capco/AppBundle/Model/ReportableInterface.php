<?php

namespace Capco\AppBundle\Model;

use Capco\AppBundle\Entity\Reporting;
use Capco\UserBundle\Entity\User;

interface ReportableInterface extends ModerableInterface
{
    public function getReports(): iterable;

    public function addReport(Reporting $report);

    public function removeReport(Reporting $report);

    public function userDidReport(?User $user = null): bool;

    public function isUserAuthor(?User $user = null): bool;
}
