<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminPageTrait
{
    /**
     * @When i go to the admin section list page
     */
    public function IGoToTheAdminSectionListPage(): void
    {
        $this->iVisitedPage('AdminSectionListPage');
    }

    /**
     * @When I go to the admin section page with sectionId :sectionId
     */
    public function iGoToTheAdminSectionPageWithId(int $sectionId): void
    {
        $this->visitPageWithParams('admin section page', ['sectionId' => $sectionId]);
    }
}
