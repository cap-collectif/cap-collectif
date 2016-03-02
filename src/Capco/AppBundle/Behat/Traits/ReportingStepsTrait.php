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
     * I fill the reporting form from the modal.
     *
     * @When I fill the reporting form from the modal
     */
    public function iFillTheReportingFormFromTheModal()
    {
        $this->fillField('reportBody', 'Pas terrible tout ça...');
        $this->selectOption('reportType', 'Contenu à caractère sexuel');
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

    /**
     * I submit the reporting form from the modal.
     *
     * @When I submit the reporting form from the modal
     */
    public function iSubmitTheReportingFormFromTheModal()
    {
        $this->getSession()->getPage()->find('css', '.report-button-submit')->click();
        $this->iWait(1);
    }
}
