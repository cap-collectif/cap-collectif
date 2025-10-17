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
}
