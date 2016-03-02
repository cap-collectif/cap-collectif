<?php

namespace Capco\AppBundle\Behat\Traits;

trait ProjectStepsTrait
{
    /**
     * Go to a project stats page.
     *
     * @When I go to a project stats page
     */
    public function iGoToAProjectStatsPage()
    {
        $this->visitPageWithParams('project stats page', ['projectSlug' => 'projet-avec-budget']);
    }

    /**
     * I should see theme stats.
     *
     * @Then I should see theme stats
     */
    public function iShouldSeeThemeStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getThemeStatsItemsSelector();
        $this->assertNumElements(4, $selector);
    }

    /**
     * I should see districts stats.
     *
     * @Then I should see district stats
     */
    public function iShouldSeeDistrictsStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getDistrictStatsItemsSelector();
        $this->assertNumElements(10, $selector);
    }

    /**
     * I should see user types stats.
     *
     * @Then I should see user types stats
     */
    public function iShouldSeeUserTypeStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getUserTypeStatsItemsSelector();
        $this->assertNumElements(4, $selector);
    }

    /**
     * I should see costs stats.
     *
     * @Then I should see costs stats
     */
    public function iShouldSeeCostsStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getCostsStatsItemsSelector();
        $this->assertNumElements(3, $selector);
    }

    /**
     * I should see votes stats.
     *
     * @Then I should see votes stats
     */
    public function iShouldSeeVotesStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getVotesStatsItemsSelector();
        $this->assertNumElements(3, $selector);
    }

    /**
     * I go to the selection step stats.
     *
     * @When I go to the selection step stats
     */
    public function iGoToTheSelectionStepStats()
    {
        $this->clickLink('Sélection avec vote selon le budget');
        $this->iWait(1);
    }

    /**
     * I click the show all districts stats button.
     *
     * @When I click the show all districts stats button
     */
    public function iClickTheShowAllDistrictsStatsButton()
    {
        $selector = $this->navigationContext->getPage('project stats page')->showAllDistrictStats();
        $this->iWait(1);
    }

    /**
     * I should see all districts stats.
     *
     * @Then I should see all districts stats
     */
    public function iShouldSeeAllDistrictsStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getDistrictStatsModalItemsSelector();
        $this->assertNumElements(12, $selector);
    }

    /**
     * I filter votes stats by theme.
     *
     * @When I filter votes stats by theme
     */
    public function iFilterVotesStatsByTheme()
    {
        $this->navigationContext->getPage('project stats page')->filterByTheme();
        $this->iWait(1);
    }

    /**
     * I filter votes stats by district.
     *
     * @When I filter votes stats by district
     */
    public function iFilterVotesStatsByDistrict()
    {
        $this->navigationContext->getPage('project stats page')->filterByDistrict();
        $this->iWait(1);
    }

    /**
     * The votes stats should be filtered by theme.
     *
     * @Then the votes stats should be filtered by theme
     */
    public function theVotesStatsShouldBeFilteredByTheme()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getVotesStatsItemsSelector();
        $this->assertNumElements(3, $selector);
    }

    /**
     * The votes stats should be filtered by theme and district.
     *
     * @Then the votes stats should be filtered by theme and district
     */
    public function theVotesStatsShouldBeFilteredByThemeAndDistrict()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getVotesStatsItemsSelector();
        $this->assertNumElements(0, $selector);
    }
}
