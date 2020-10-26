<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Reporting;

trait ReportableTrait
{
    public function getReports(): iterable
    {
        return $this->reports;
    }

    public function addReport(Reporting $report): self
    {
        if (!$this->reports->contains($report)) {
            $this->reports->add($report);
        }

        return $this;
    }

    public function removeReport(Reporting $report): self
    {
        $this->reports->removeElement($report);

        return $this;
    }
}
