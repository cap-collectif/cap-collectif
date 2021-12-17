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
        $this->waitAndThrowOnFailure(
            5000,
            "document.body.innerHTML.toString().indexOf('admin.label.settings.global') > -1"
        );
    }

    /**
     * @When I go to the admin argument list page
     */
    public function iGoToTheAdminArgumentListPage()
    {
        $this->iVisitedPage('AdminContributionArgumentPage');
    }

    /**
     * @When I go to the admin blog post list page
     */
    public function iGoToTheAdminBlogPostListPage()
    {
        $this->iVisitedPage('AdminBlogPostListPage');
    }

    /**
     * @When I go to the admin sources list page
     */
    public function iGoToTheAdminSourcesListPage()
    {
        $this->iVisitedPage('AdminSourcesListPage');
    }

    /**
     * @When I go to the admin opinion version list page
     */
    public function iGoToTheAdminOpinionVersionListPage()
    {
        $this->iVisitedPage('AdminOpinionVersionListPage');
    }
}
