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
     * @When I save shield admin form
     */
    public function iSaveShieldAdminForm()
    {
        $this->getCurrentPage()->clickSaveButton();
    }
}
