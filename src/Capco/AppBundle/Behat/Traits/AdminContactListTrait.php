<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminContactListTrait
{
    /**
     * @When I go to the admin contact list page
     */
    public function iGoToTheAdminContactListPage()
    {
        $this->visitPageWithParams('admin contact list page');
    }
}
