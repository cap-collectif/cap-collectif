<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminShieldTrait
{
    /**
     * @When I go to the admin shield configuration page
     */
    public function iGoToTheAdminShieldConfigurationPage()
    {
        $this->iVisitedPage('AdminShieldConfigurationPage');
    }

    /**
     * @When I toggle shield mode
     */
    public function iToggleShieldMode()
    {
        $page = $this->getCurrentPage();
        $page->clickOnButtonOrRadio('shield admin form toggle');
        $this->iWait(1);
    }

    /**
     * @When I save shield admin form
     */
    public function iSaveShieldAdminForm()
    {
        $this->getCurrentPage()->clickSaveButton();
    }
}
