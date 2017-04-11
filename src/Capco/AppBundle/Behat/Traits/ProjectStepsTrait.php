<?php

namespace Capco\AppBundle\Behat\Traits;

trait ProjectStepsTrait
{
    /**
     * @Then project with slug :slug should have author :authorId
     */
    public function projectShouldHaveAuthor(string $slug, string $authorId)
    {
        $this->getEntityManager()->clear();
        $project = $this->getRepository('CapcoAppBundle:Project')->findOneBySlug($slug);
        expect($project->getAuthor()->getId())->toBe($authorId);
    }

    /**
     * @Then project with slug :slug is not published
     * @Then project with slug :slug should not be published
     */
    public function projectIsNotPublished(string $slug)
    {
        $this->getEntityManager()->clear();
        $project = $this->getRepository('CapcoAppBundle:Project')->findOneBySlug($slug);
        expect($project->getIsEnabled())->toBe(false);
    }

    /**
     * @When I go to a project stats page
     */
    public function iGoToAProjectStatsPage()
    {
        $this->visitPageWithParams('project stats page', ['projectSlug' => 'depot-avec-selection-vote-budget']);
    }

    /**
     * @Then I should see theme stats
     */
    public function iShouldSeeThemeStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getThemeStatsItemsSelector();
        $this->assertNumElements(4, $selector);
    }

    /**
     * @Then I should see district stats
     */
    public function iShouldSeeDistrictsStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getDistrictStatsItemsSelector();
        $this->assertNumElements(10, $selector);
    }

    /**
     * @Then I should see user types stats
     */
    public function iShouldSeeUserTypeStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getUserTypeStatsItemsSelector();
        $this->assertNumElements(4, $selector);
    }

    /**
     * @Then I should see costs stats
     */
    public function iShouldSeeCostsStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getCostsStatsItemsSelector();
        $this->assertNumElements(3, $selector);
    }

    /**
     * @Then I should see votes stats
     */
    public function iShouldSeeVotesStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getVotesStatsItemsSelector();
        $this->assertNumElements(3, $selector);
    }

    /**
     * @When I go to the selection step stats
     */
    public function iGoToTheSelectionStepStats()
    {
        $this->clickLink('Sélection avec vote selon le budget');
        $this->iWait(1);
    }

    /**
     * @When I click the show all districts stats button
     */
    public function iClickTheShowAllDistrictsStatsButton()
    {
        $selector = $this->navigationContext->getPage('project stats page')->showAllDistrictStats();
        $this->iWait(1);
    }

    /**
     * @Then I should see all districts stats
     */
    public function iShouldSeeAllDistrictsStats()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getDistrictStatsModalItemsSelector();
        $this->assertNumElements(12, $selector);
    }

    /**
     * @When I filter votes stats by district
     */
    public function iFilterVotesStatsByDistrict()
    {
        $this->navigationContext->getPage('project stats page')->filterByDistrict();
        $this->iWait(1);
    }

    /**
     * @When I filter votes stats by category
     */
    public function iFilterVotesStatsByCategory()
    {
        $this->navigationContext->getPage('project stats page')->filterByCategory();
        $this->iWait(1);
    }

    /**
     * @Then the votes stats should be filtered by category
     */
    public function theVotesStatsShouldBeFilteredByCategory()
    {
        $selector = $this->navigationContext->getPage('project stats page')->getVotesStatsItemsSelector();
        $this->assertNumElements(2, $selector);
    }
}
