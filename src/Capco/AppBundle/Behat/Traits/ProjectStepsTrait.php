<?php

namespace Capco\AppBundle\Behat\Traits;

use Capco\AppBundle\Entity\Project;

trait ProjectStepsTrait
{
    protected static $collectStepWithVote = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'depot-avec-vote',
    ];

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
        /** @var Project $project */
        $project = $this->getRepository('CapcoAppBundle:Project')->findOneBySlug($slug);
        expect($project->isPublic())->toBe(false);
    }

    /**
     * @When I go to a project stats page
     */
    public function iGoToAProjectStatsPage()
    {
        $this->visitPageWithParams('project stats page', [
            'projectSlug' => 'depot-avec-selection-vote-budget',
        ]);
    }

    /**
     * @Then I should see theme stats
     */
    public function iShouldSeeThemeStats()
    {
        $selector = $this->navigationContext
            ->getPage('project stats page')
            ->getThemeStatsItemsSelector();
        $this->assertNumElements(4, $selector);
    }

    /**
     * @Then I should see district stats
     */
    public function iShouldSeeDistrictsStats()
    {
        $selector = $this->navigationContext
            ->getPage('project stats page')
            ->getDistrictStatsItemsSelector();
        $this->assertNumElements(10, $selector);
    }

    /**
     * @Then I should see user types stats
     */
    public function iShouldSeeUserTypeStats()
    {
        $selector = $this->navigationContext
            ->getPage('project stats page')
            ->getUserTypeStatsItemsSelector();
        $this->assertNumElements(4, $selector);
    }

    /**
     * @Then I should see costs stats
     */
    public function iShouldSeeCostsStats()
    {
        $selector = $this->navigationContext
            ->getPage('project stats page')
            ->getCostsStatsItemsSelector();
        $this->assertNumElements(3, $selector);
    }

    /**
     * @Then I should see votes stats
     */
    public function iShouldSeeVotesStats()
    {
        $selector = $this->navigationContext
            ->getPage('project stats page')
            ->getVotesStatsItemsSelector();
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
     * @When I go to a collect step with vote
     */
    public function iGoToACollectStepWithVote()
    {
        $this->visitPageWithParams('collect page', self::$collectStepWithVote);
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
     * @When I vote for the first proposal
     */
    public function iVoteForTheFirstProposal()
    {
        $this->navigationContext->getPage('collect page')->clickVoteProposalButton();
        $this->iWait(2);
    }

    /**
     * @When I follow the first proposal
     */
    public function iFollowForTheFirstProposal()
    {
        $this->navigationContext->getPage('collect page')->clickFollowProposalButton();
        $this->iWait(1);
    }

    /**
     * @When I should see proposal followed as :type
     */
    public function iShouldSeeProposalFollowedAs(string $type)
    {
        $this->navigationContext->getPage('collect page')->isFollowedAs($type);
        $this->iWait(1);
    }

    /**
     * @When I change the type of proposal follow with type :type
     *
     * @param mixed $type
     */
    public function iChangeTypeOfProposalFollow($type)
    {
        $this->navigationContext->getPage('collect page')->changeTypeOfProposalFollow($type);
        $this->iWait(1);
    }

    /**
     * @When I unfollow the first proposal
     */
    public function iUnfollowForTheFirstProposal()
    {
        $this->navigationContext->getPage('collect page')->clickFollowProposalButton();
        $this->iWait(1);
    }

    /**
     * @Then I should see all districts stats
     */
    public function iShouldSeeAllDistrictsStats()
    {
        $selector = $this->navigationContext
            ->getPage('project stats page')
            ->getDistrictStatsModalItemsSelector();
        $this->assertNumElements(16, $selector);
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
     * @Then the votes stats should be filtered by category and I should see :number items
     *
     * @param mixed $number
     */
    public function theVotesStatsShouldBeFilteredByCategory($number)
    {
        $selector = $this->navigationContext
            ->getPage('project stats page')
            ->getVotesStatsItemsSelector();
        $this->assertNumElements($number, $selector);
    }

    /**
     * @Then I open restricted access modal
     */
    public function iOpenRestrictedAccessModal()
    {
        $page = $this->navigationContext->getPage('collect page');
        $this->waitAndThrowOnFailure(
            3000,
            "$('" . $page->getSelector('restricted-access') . "').length > 0"
        );
        $page->clickOnRestrictedAccess();
        $this->iWait(1);
    }

    /**
     * @Then I unfold :groupId group inside restricted access modal
     */
    public function iUnfoldGroupInsideRestrictedAccessModal(string $groupId)
    {
        $this->navigationContext->getPage('collect page')->iClickOnUserGroupModal($groupId);
        $this->iWait(1);
    }
}
