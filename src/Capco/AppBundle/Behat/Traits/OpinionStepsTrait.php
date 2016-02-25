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
