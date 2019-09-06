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

    /**
     * @When I search :search in admin
     */
    public function iSearchInAdmin(string $search)
    {
        $this->iWaitElementToAppearOnPage('#sonata-search');
        $this->fillField('sonata-search', $search);
        $this->iClickOnButton('#sonata-search-submit');
        $this->iWait(1);
    }
}
