<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminGeneralTait
{
    /**
     * @When I go to the admin general list page
     */
    public function iGoToTheAdminGeneralListPage()
    {
        $this->iVisitedPage('AdminGeneralListPage');
    }
}
