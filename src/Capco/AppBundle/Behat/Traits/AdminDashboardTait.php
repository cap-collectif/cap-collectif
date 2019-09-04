<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminDashboardTait
{
    /**
     * @When I go to the admin dashboard page
     */
    public function iGoToTheAdminDashboardPage()
    {
        $this->iVisitedPage('AdminDashboardPage');
    }
}
