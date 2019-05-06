<?php

namespace Capco\AppBundle\Behat\Traits;

trait ReportingStepsTrait
{
    /**
     * @When I fill the reporting form
     */
    public function iFillTheReportingFormFromTheModal()
    {
        $this->waitAndThrowOnFailure(2000, "$('#reportBody').length > 0");
        $this->fillField('reportBody', 'Pas terrible tout ça...');
        $this->selectOption('reportType', 'reporting.status.spam');
    }

    /**
     * @When I submit the reporting form
     */
    public function iSubmitTheReportingFormFromTheModal()
    {
        $this->getSession()->getPage()->find('css', '#report-button-submit')->click();
        $this->iWait(2);
    }
}
