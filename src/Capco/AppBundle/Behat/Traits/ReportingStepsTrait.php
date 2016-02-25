<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Gherkin\Node\TableNode;

trait ReportingStepsTrait
{
    /**
     * I fill the reporting form.
     *
     * @When I fill the reporting form
     */
    public function iFillTheReportingForm()
    {
        $tableNode = new TableNode([
            ['capco_app_reporting_status', '1'],
            ['capco_app_reporting_body', 'Pas terrible tout ça...'],
        ]);
        $this->fillFields($tableNode);
    }

    /**
     * I submit the reporting form.
     *
     * @When I submit the reporting form
     */
    public function iSubmitTheReportingForm()
    {
        $this->pressButton('Signaler');
        $this->iWait(1);
    }
}
