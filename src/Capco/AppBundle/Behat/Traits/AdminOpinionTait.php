<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminOpinionTait
{
    /**
     * @When I go to the admin opinion list page
     */
    public function iGoToTheAdminOpinionListPage()
    {
        $this->iVisitedPage('AdminOpinionListPage');
    }
}
