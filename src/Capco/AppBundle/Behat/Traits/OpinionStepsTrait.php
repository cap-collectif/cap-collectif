<?php

namespace Capco\AppBundle\Behat\Traits;

trait OpinionStepsTrait
{
    protected static $opinionWithVersions = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-1',
    ];
    protected static $opinionWithLoadsOfVotes = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-2',
    ];
    protected static $version = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-1',
        'versionSlug' => 'modification-1',
    ];
    protected static $opinionVersionWithLoadsOfVotes = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-2',
        'versionSlug' => 'modification-2',
    ];

    // ************************************ Opinion **************************************************

    /**
     * Go to a opinion with loads of votes.
     *
     * @When I go to an opinion with loads of votes
     */
    public function iGoToAnOpinionWithLoadsOfVote()
    {
        $this->visitPageWithParams('opinion page', self::$opinionWithLoadsOfVotes);
    }

    /**
     * I click the show all opinion votes button.
     *
     * @When I click the show all opinion votes button
     */
    public function iClickTheShowAllOpinionVotesButton()
    {
        $this->navigationContext->getPage('opinion page')->clickShowAllVotesButton();
        $this->iWait(1);
    }

    /**
     * I should see all opinion votes.
     *
     * @Then I should see all opinion votes
     */
    public function iShouldSeeAllOpinionVotes()
    {
        $votesInModalSelector = $this->navigationContext->getPage('opinion page')->getVotesInModalSelector();
        $this->assertNumElements(44, $votesInModalSelector);
    }

    /**
     * @When I submit a :type argument with text :text
     */
    public function iSubmitAnArgument($type, $text)
    {
        $this->getSession()->wait(1200);
        $this->navigationContext->getPage('opinionPage')->submitArgument($type, $text);
    }

    /**
     * I click the share opinion button.
     *
     * @When I click the share opinion button
     */
    public function iClickTheShareOpinionButton()
    {
        $this->navigationContext->getPage('opinion page')->clickShareButton();
        $this->iWait(1);
    }

    /**
     * @When I vote for the first source
     */
    public function iVoteForTheFirstSource()
    {
        $page = $this->navigationContext->getPage('opinion page');
        $this->getSession()->wait(3000, "$('".$page->getSelector('Vote first source')."').length > 0");
        $page->voteForFirstSource();
    }

    /**
     * @When I go on the sources tab
     */
    public function iGoOnTheSourcesTab()
    {
        $page = $this->navigationContext->getPage('opinion page');
        $this->getSession()->wait(3000, "$('".$page->getSelector('sources tab')."').length > 0");
        $page->clickSourcesTab();
    }

    /**
     * @When I go on the arguments tab
     */
    public function iGoOnTheArgumentsTab()
    {
        $page = $this->navigationContext->getPage('opinion page');
        $this->getSession()->wait(3000, "$('".$page->getSelector('arguments tab')."').length > 0");
        $page->clickArgumentsTab();
    }

    /**
     * @When I go on the connections tab
     */
    public function iGoOnTheConnectionsTab()
    {
        $page = $this->navigationContext->getPage('opinion page');
        $this->getSession()->wait(3000, "$('".$page->getSelector('connections tab')."').length > 0");
        $page->clickConnectionsTab();
    }

    /**
     * @When I go on the votes evolution tab
     */
    public function iGoOnTheVotesEvolutionTab()
    {
        $page = $this->navigationContext->getPage('opinion page');
        $this->getSession()->wait(3000, "$('".$page->getSelector('votes evolution tab')."').length > 0");
        $page->clickVotesEvolutionTab();
    }

    /**
     * @When I want to add a source
     */
    public function clickAddSourceTab()
    {
        $page = $this->navigationContext->getPage('opinion page');
        $this->getSession()->wait(2000, "$('".$page->getSelector('sources add')."').length > 0");
        $page->clickAddSource();
    }

    // ************************ Opinion versions **************************************

    /**
     * Go to an opinion with versions.
     *
     * @When I go to an opinion with versions
     */
    public function iGoToAnOpinionWithVersions()
    {
        $this->visitPageWithParams('opinion page', self::$opinionWithVersions);
    }

    /**
     * Go to a version.
     *
     * @When I go to a version
     */
    public function iGoToAVersion()
    {
        $this->visitPageWithParams('opinion version page', self::$version);
    }

    /**
     * Go to a opinion version with loads of votes.
     *
     * @When I go to an opinion version with loads of votes
     */
    public function iGoToAnOpinionVersionWithLoadsOfVote()
    {
        $this->visitPageWithParams('opinion version page', self::$opinionVersionWithLoadsOfVotes);
    }

    /**
     * I should not see the delete version button.
     *
     * @Then I should not see the delete version button
     */
    public function iShouldNotSeeTheDeleteVersionButton()
    {
        $buttonSelector = $this->navigationContext->getPage('opinion version page')->getDeleteButtonSelector();
        $this->assertElementNotOnPage($buttonSelector);
    }

    /**
     * I click the delete version button.
     *
     * @When I click the delete version button
     */
    public function iClickTheDeleteVersionButton()
    {
        $this->navigationContext->getPage('opinion version page')->clickDeleteButton();
        $this->iWait(1);
    }

    /**
     * I confirm version deletion.
     *
     * @When I confirm version deletion
     */
    public function iConfirmVersionDeletion()
    {
        $this->navigationContext->getPage('opinion version page')->confirmDeletion();
        $this->iWait(1);
    }

    /**
     * I should not see my version anymore.
     *
     * @Then I should not see my version anymore
     */
    public function iShouldNotSeeMyVersionAnymore()
    {
        $this->assertPageNotContainsText('Modification 1');
    }

    /**
     * I click the show all opinion version votes button.
     *
     * @When I click the show all opinion version votes button
     */
    public function iClickTheShowAllOpinionVersionVotesButton()
    {
        $this->navigationContext->getPage('opinion version page')->clickShowAllVotesButton();
        $this->iWait(1);
    }

    /**
     * I should see all opinion version votes.
     *
     * @Then I should see all opinion version votes
     */
    public function iShouldSeeAllOpinionVersionVotes()
    {
        $votesInModalSelector = $this->navigationContext->getPage('opinion version page')->getVotesInModalSelector();
        $this->assertNumElements(49, $votesInModalSelector);
    }
}
