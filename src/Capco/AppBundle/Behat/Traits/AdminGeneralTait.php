<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminGeneralTait
{
    /**
     * @When I go to the admin blog post list page
     */
    public function iGoToTheAdminBlogPostListPage()
    {
        $this->iVisitedPage('AdminBlogPostListPage');
    }

    /**
     * @When I go to the admin opinion version list page
     */
    public function iGoToTheAdminOpinionVersionListPage()
    {
        $this->iVisitedPage('AdminOpinionVersionListPage');
    }
}
