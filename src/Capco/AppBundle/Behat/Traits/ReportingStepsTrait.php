<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Gherkin\Node\TableNode;

trait ReportingStepsTrait
{
    /**
     * @When I fill the reporting form
     */
    public function iFillTheReportingFormFromTheModal()
    {
        $this->fillField('reportBody', 'Pas terrible tout ça...');
        $this->selectOption('reportType', 'Contenu à caractère sexuel');
    }

    /**
     * @When I submit the reporting form
     */
    public function iSubmitTheReportingFormFromTheModal()
    {
        $this->getSession()->getPage()->find('css', '#report-button-submit')->click();
        $this->iWait(1);
    }
}
