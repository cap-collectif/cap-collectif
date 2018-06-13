<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminUserTrait
{

    /**
     * @When I go to the admin user :tab tab
     *
     * @param mixed $tab
     */
    public function iGoToTheAdminUserTab($tab)
    {
        $page = $this->getCurrentPage();
        $this->iWait(3); // Wait alert to disappear
        $this->getSession()->wait(3000, "$('" . $page->getSelector('user ' . $tab . ' tab') . "').length > 0");
        $page->clickOnTab($tab);
        $this->iWait(1);
    }

    /**
     * @When I delete the user
     */
    public function iDeleteTheUser()
    {
        $element = '#user-admin-page-tabs-pane-6 button[type="button"][class="btn btn-danger"]';
        $this->getCurrentPage()->find('css', $element)->click();
    }

    /**
     * @When I confirm the admin user deletion
     */
    public function iConfirmAdminUserDeletion()
    {
        $this->getSession()->getDriver()->getWebDriverSession()->accept_alert();
    }

}
