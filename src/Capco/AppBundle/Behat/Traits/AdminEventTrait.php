<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminEventTrait
{
    /**
     * @When I go to the admin event list page
     */
    public function iGoToTheAdminEventListPage()
    {
        $this->iVisitedPage('AdminEventListPage');
    }

    /**
     * @When I open the import events modal
     */
    public function iOpenTheImportEventsModal()
    {
        $this->getCurrentPage()->clickImportButton();
    }

    /**
     * @Then I can confirm my events import
     */
    public function iConfirmMyEventImportInModal()
    {
        $this->getCurrentPage()->submitImportModal();
    }
}
