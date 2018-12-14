<?php

namespace Capco\AppBundle\Behat\Traits;

use PHPUnit\Framework\Assert;

trait OpinionStepsTrait
{
    protected static $opinion = [
        'projectSlug' => 'croissance-innovation-disruption',
        'stepSlug' => 'collecte-des-avis',
        'opinionTypeSlug' => 'les-causes',
        'opinionSlug' => 'opinion-2',
    ];

    protected static $opinionInClosedStep = [
        'projectSlug' => 'strategie-technologique-de-letat-et-services-publics',
        'stepSlug' => 'collecte-des-avis-pour-une-meilleur-strategie',
        'opinionTypeSlug' => 'les-causes',
        'opinionSlug' => 'opinion-51',
    ];
    protected static $opinionWithVersions = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' =>
            'titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-1',
    ];
    protected static $opinionWithLoadsOfVotes = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' =>
            'titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-2',
    ];
    protected static $opinionWithNoSources = [
        'projectSlug' => 'croissance-innovation-disruption',
        'stepSlug' => 'collecte-des-avis',
        'opinionTypeSlug' => 'les-causes',
        'opinionSlug' => 'opinion-sans-sources',
    ];
    protected static $version = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' =>
            'titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-1',
        'versionSlug' => 'modification-1',
    ];
    protected static $opinionVersionWithLoadsOfVotes = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' =>
            'titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-2',
        'versionSlug' => 'modification-2',
    ];

    protected static $versionWithLoadsOfVotes = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' =>
            'titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-2',
        'versionSlug' => 'modification-2',
    ];
    protected static $versionInClosedStep = [
        'projectSlug' => 'strategie-technologique-de-letat-et-services-publics',
        'stepSlug' => 'collecte-des-avis-pour-une-meilleur-strategie',
        'opinionTypeSlug' => 'les-causes',
        'opinionSlug' => 'opinion-51',
        'versionSlug' => 'version-sur-une-etape-fermee',
    ];

    // ************************************ Opinion **************************************************

    /**
     * @When I go to an opinion
     */
    public function iGoToAnOpinion()
    {
        $this->visitPageWithParams('opinion page', self::$opinion);
        $this->getSession()->wait(4000, "$('#opinion__arguments--AGAINST').length > 0");

        $this->getSession()->wait(
            5000,
            "document.body.innerHTML.toString().indexOf('Magni voluptates harum modi tempore quis numquam. Est atque nulla rerum et aut aut fugit.') > -1"
        );
    }

    /**
     * Go to a opinion in a closed step.
     *
     * @When I go to an opinion in a closed step
     */
    public function iGoToAnOpinionInAClosedStep()
    {
        $this->getSession()->wait(3000, "$('#opinion-page-tabs').length > 0");
        $this->visitPageWithParams('opinion page', self::$opinionInClosedStep);
    }

    /**
     * Go to a opinion with loads of votes.
     *
     * @When I go to an opinion with loads of votes
     */
    public function iGoToAnOpinionWithLoadsOfVote()
    {
        $this->visitPageWithParams(
            'opinion page',
            self::$opinionWithLoadsOfVotes,
            'opinion-page-tabs'
        );
    }

    /**
     * Go to a opinion with no sources.
     *
     * @When I go to an opinion with no sources
     */
    public function iGoToAnOpinionWithNoSources()
    {
        $this->visitPageWithParams(
            'opinion page',
            self::$opinionWithNoSources,
            'opinion-page-tabs'
        );
    }

    /**
     * @When I click the show all opinion votes button
     */
    public function iClickTheShowAllOpinionVotesButton()
    {
        $this->getSession()->wait(3000, "$('#opinion-votes-show-all').length > 0");
        $this->navigationContext->getPage('opinion page')->clickShowAllVotesButton();
    }

    /**
     * @Then I should see all opinion votes
     */
    public function iShouldSeeAllOpinionVotes()
    {
        $this->getSession()->wait(
            3000,
            "$('.opinion__votes__more__modal .opinion__votes__userbox').length > 0"
        );
        $votesInModalSelector = $this->navigationContext
            ->getPage('opinion page')
            ->getVotesInModalSelector();
        $this->assertNumElements(45, $votesInModalSelector);
    }

    /**
     * I click the share opinion button.
     *
     * @When I click the share opinion button
     */
    public function iClickTheShareOpinionButton()
    {
        $this->getSession()->wait(3000, "$('#opinion-share-button').length > 0");
        $this->navigationContext->getPage('opinion page')->clickShareButton();
    }

    /**
     * @When I go on the sources tab
     */
    public function iGoOnTheSourcesTab()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(
            3000,
            "$('" . $page->getSelector('sources tab') . "').length > 0"
        );
        $page->clickSourcesTab();
        $this->iWait(1);
    }

    /**
     * @When I go on the arguments tab
     */
    public function iGoOnTheArgumentsTab()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(
            3000,
            "$('" . $page->getSelector('arguments tab') . "').length > 0"
        );
        $page->clickArgumentsTab();
        $this->iWait(1);
    }

    /**
     * @When I go on the connections tab
     */
    public function iGoOnTheConnectionsTab()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(
            3000,
            "$('" . $page->getSelector('connections tab') . "').length > 0"
        );
        $page->clickConnectionsTab();
        $this->iWait(1);
    }

    /**
     * @When I go on the votes evolution tab
     */
    public function iGoOnTheVotesEvolutionTab()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(
            3000,
            "$('" . $page->getSelector('votes evolution tab') . "').length > 0"
        );
        $page->clickVotesEvolutionTab();
        $this->iWait(1);
    }

    // *************************************** Arguments ******************************************

    public function submitArgumentForTypeWithText($type, $text)
    {
        $this->getSession()->wait(3000, "$('#argument-form--FOR textarea').length > 0");
        $this->navigationContext->getPage('opinion page')->submitArgument($type, $text);
        $this->iWait(3);
    }

    /**
     * @When I submit an argument
     */
    public function iSubmitAnArgument()
    {
        $this->submitArgumentForTypeWithText('yes', 'Texte de mon argument');
    }

    /**
     * @Then I should see my new published argument
     */
    public function iShouldSeeMyNewPublishedArgument()
    {
        $selector = $this->navigationContext->getPage('opinion page')->getArgumentsYesBoxSelector();
        $this->assertElementContainsText($selector, 'Texte de mon argument');
    }

    /**
     * @Then I should see my new unpublished argument
     */
    public function iShouldSeeMyNewUnpublishedArgument()
    {
        $selector = $this->navigationContext
            ->getPage('opinion page')
            ->getUnpublishedArgumentsYesBoxSelector();
        $this->assertElementContainsText($selector, 'Texte de mon argument');
    }

    /**
     * @Then my argument should have changed
     */
    public function myArgumentShouldHaveChanged()
    {
        $selector = $this->getCurrentPage()->getArgumentsNoBoxSelector();
        $this->assertElementContainsText($selector, 'Je modifie mon argument !');
    }

    /**
     * @Then I should see the argument creation boxes disabled
     */
    public function iShouldSeeTheArgumentCreationBoxesDisabled()
    {
        $this->iShouldSeeElementOnPageDisabled('argument yes field', 'opinion page');
        $this->iShouldSeeElementOnPageDisabled('argument no field', 'opinion page');
    }

    /**
     * @When I edit my argument
     */
    public function iEditMyArgument()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(3000, "$('.opinion__votes-nb').length > 0");
        $votesCount = $page->getArgumentVotesCount();
        Assert::assertNotEquals(
            0,
            $votesCount,
            'Argument has no votes from the begining, test will not be conclusive.'
        );
        $page->clickArgumentEditButton();
        $this->getSession()->wait(3000, "$('#argument-form #argument-body').length > 0");
        $page->fillArgumentBodyField();
        $page->checkArgumentConfirmCheckbox();
        $page->submitArgumentEditForm();
        $this->iWait(1);
    }

    /**
     * @When I edit my argument without confirming my votes lost
     */
    public function iEditMyArgumentwithoutConfirmingMyVotesLost()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(3000, "$('.opinion__votes-nb').length > 0");
        $votesCount = $page->getArgumentVotesCount();
        Assert::assertNotEquals(
            0,
            $votesCount,
            'Argument has no votes from the begining, test will not be conclusive.'
        );
        $page->clickArgumentEditButton();
        $this->getSession()->wait(3000, "$('#argument-form #argument-body').length > 0");
        $page->fillArgumentBodyField();
        $page->submitArgumentEditForm();
        $this->iWait(1);
    }

    /**
     * @Then my argument should have lost its votes
     */
    public function myArgumentShouldHaveLostItsVotes()
    {
        $page = $this->getCurrentPage();
        $votesCount = $page->getArgumentVotesCount();
        Assert::assertEquals(
            0,
            $votesCount,
            'Incorrect votes number ' . $votesCount . ' for argument after edition.'
        );
    }

    /**
     * I should not see the argument edit button.
     *
     * @Then I should not see the argument edit button
     */
    public function iShouldNotSeeTheArgumentEditButton()
    {
        $this->iShouldNotSeeElementOnPage('argument edit button', 'opinion page');
    }

    /**
     * I delete my argument.
     *
     * @When I delete my argument
     */
    public function iDeleteMyArgument()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(3000, '$("#confirm-argument-delete").length > 0');
        $page->clickArgumentDeleteButton();

        $this->getSession()->wait(3000, '$("#arg-argument1 .argument__btn--delete").length > 0');
        $page->clickArgumentConfirmDeletionButton();
    }

    /**
     * I should not see my argument anymore.
     *
     * @Then I should not see my argument anymore
     */
    public function iShouldNotSeeMyArgumentAnymore()
    {
        $this->assertPageNotContainsText('Coucou, je suis un bel argument !');
    }

    /**
     * I should not see the argument delete button.
     *
     * @Then I should not see the argument delete button
     */
    public function iShouldNotSeeTheArgumentDeleteButton()
    {
        $this->iShouldNotSeeElementOnPage('argument delete button', $this->currentPage);
    }

    /**
     * @When I vote for the argument
     */
    public function iVoteForTheArgument()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(3000, '$(".opinion__votes-nb").length > 0');
        $wantedVotesCount = $page->getArgumentVotesCount() + 1;
        $this->clickArgumentVoteButtonWithLabel('vote.ok');
        $newVotesCount = $page->getArgumentVotesCount();
        Assert::assertEquals(
            $wantedVotesCount,
            $newVotesCount,
            'Argument votes number should be increased by 1.'
        );
    }

    /**
     * @When I delete my vote on the argument
     */
    public function iDeleteMyVoteOnTheArgument()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(3000, '$(".opinion__votes-nb").length > 0');

        $wantedVotesCount = $page->getArgumentVotesCount() - 1;
        $this->clickArgumentVoteButtonWithLabel('vote.cancel');
        $newVotesCount = $page->getArgumentVotesCount();
        Assert::assertEquals(
            $wantedVotesCount,
            $newVotesCount,
            'Argument votes number should be decreased by 1.'
        );
    }

    /**
     * I click the argument vote button.
     *
     * @When I click the argument vote button
     */
    public function iClickTheArgumentVoteButton()
    {
        $this->getSession()->wait(3000, "$('.argument__btn--vote').length > 0");
        $this->clickArgumentVoteButtonWithLabel('vote.ok');
    }

    /**
     * The argument vote button should be disabled.
     *
     * @Then the argument vote button should be disabled
     */
    public function theArgumentVoteButtonShouldBeDisabled()
    {
        $page = $this->getCurrentPage();
        $inClosedStep =
            $this->opinionPageInClosedStepIsOpen() || $this->versionPageInClosedStepIsOpen();
        $this->getSession()->wait(3000, "$('.argument__btn--vote').length > 0");
        $button = $page->getArgumentVoteButton($inClosedStep);
        Assert::assertTrue($button->hasAttribute('disabled'));
    }

    /**
     * I should not see the argument report button.
     *
     * @Then I should not see the argument report button
     */
    public function iShouldNotSeeTheArgumentReportButton()
    {
        $this->iShouldNotSeeElementOnPage('argument report button', 'opinion page');
    }

    /**
     * @When I click the argument report button
     */
    public function iClickTheArgumentReportButton()
    {
        $this->getSession()->wait(3000, "$('#report-argument-argument1-button').length > 0");
        $this->getCurrentPage()->clickArgumentReportButton();
    }

    /**
     * @When I vote for the first source
     */
    public function iVoteForTheFirstSource()
    {
        $page = $this->getCurrentPage();
        $wantedVotesCount = $page->getSourceVotesCount() + 1;
        $this->clickSourceVoteButtonWithLabel('vote.ok');
        $newVotesCount = $page->getSourceVotesCount();
        Assert::assertEquals(
            $wantedVotesCount,
            $newVotesCount,
            'Source votes number should be increased by 1.'
        );
    }

    /**
     * @When I delete my vote for the first source
     */
    public function iDeleteMyVoteForTheFirstSource()
    {
        $page = $this->getCurrentPage();
        $wantedVotesCount = $page->getSourceVotesCount() - 1;
        $this->clickSourceVoteButtonWithLabel('vote.cancel');
        $newVotesCount = $page->getSourceVotesCount();
        Assert::assertEquals(
            $wantedVotesCount,
            $newVotesCount,
            'Source votes number should be decreased by 1.'
        );
    }

    /**
     * I create a new source.
     *
     * @When I create a new source
     */
    public function iCreateANewSource()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(
            2000,
            "$('" . $page->getSelector('add source button') . "').length > 0"
        );
        $page->clickAddSource();
        $this->iWait(1);
        $page->fillSourceForm();
        $page->submitSourceForm();
        $this->iWait(2);
    }

    /**
     * @Then I should see my new source
     */
    public function iShouldSeeMyNewSource()
    {
        $page = $this->getCurrentPage();
        $this->assertPageContainsText('global.sources {"num":1}');
        $sourcesSelector = $page->getSourcesListSelector();
        $this->assertElementContainsText($sourcesSelector, 'Titre de la source');
    }

    /**
     * @Then the create source button should be disabled
     */
    public function theCreateSourceButtonShouldBeDisabled()
    {
        $page = $this->getCurrentPage();
        $button = $page->getAddSourceButton();
        Assert::assertTrue($button->hasAttribute('disabled'));
    }

    /**
     * @Then the create opinion button should be disabled
     */
    public function theCreateOpinionButtonShouldBeDisabled()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(3000, "$('#btn-add--les-causes').length > 0");
        $button = $page->find('css', '#btn-add--les-causes');
        Assert::assertTrue($button->hasAttribute('disabled'));
    }

    /**
     * @When I edit my source
     */
    public function iEditMySource()
    {
        $page = $this->getCurrentPage();
        $votesCount = $page->getSourceVotesCount();
        Assert::assertNotEquals(
            0,
            $votesCount,
            'Source has no votes from the begining, test will not be conclusive.'
        );
        $page->clickSourceEditButton();
        $this->iWait(1);
        $page->fillSourceBodyField();
        $page->checkSourceConfirmCheckbox();
        $page->submitSourceEditForm();
        $this->iWait(2);
    }

    /**
     * I edit my source without confirming my votes lost.
     *
     * @When I edit my source without confirming my votes lost
     */
    public function iEditMySourceWithoutConfirmingMyVotesLost()
    {
        $page = $this->getCurrentPage();
        $votesCount = $page->getSourceVotesCount();
        Assert::assertNotEquals(
            0,
            $votesCount,
            'Source has no votes from the begining, test will not be conclusive.'
        );
        $page->clickSourceEditButton();
        $this->iWait(1);
        $page->fillSourceBodyField();
        $page->submitSourceEditForm();
        $this->iWait(2);
    }

    /**
     * My source should have lost its votes.
     *
     * @Then my source should have lost its votes
     */
    public function mySourceShouldHaveLostItsVotes()
    {
        $page = $this->getCurrentPage();
        $votesCount = $page->getSourceVotesCount();
        Assert::assertEquals(
            0,
            $votesCount,
            'Incorrect votes number ' . $votesCount . ' for source after edition.'
        );
    }

    /**
     * I should not see the source edit button.
     *
     * @Then I should not see the source edit button
     */
    public function iShouldNotSeeTheSourceEditButton()
    {
        $this->iShouldNotSeeElementOnPage('source edit button', 'opinion page');
    }

    /**
     * I should not see the source delete button.
     *
     * @Then I should not see the source delete button
     */
    public function iShouldNotSeeTheSourceDeleteButton()
    {
        $this->iShouldNotSeeElementOnPage('source delete button', 'opinion page');
    }

    /**
     * I should not see the source report button.
     *
     * @Then I should not see the source report button
     */
    public function iShouldNotSeeTheSourceReportButton()
    {
        $this->iShouldNotSeeElementOnPage('source report button', 'opinion page');
    }

    /**
     * I click the source report button.
     *
     * @When I click the source report button
     */
    public function iClickTheSourceReportButton()
    {
        $this->getCurrentPage()->clickSourceReportButton();
        $this->iWait(1);
    }

    /**
     * I delete my source.
     *
     * @When I delete my source
     */
    public function iDeleteMySource()
    {
        $page = $this->getCurrentPage();
        $page->clickSourceDeleteButton();
        $this->iWait(1);
        $page->clickSourceConfirmDeletionButton();
        $this->iWait(1);
    }

    /**
     * I should not see my source anymore.
     *
     * @Then I should not see my source anymore
     */
    public function iShouldNotSeeMySourceAnymore()
    {
        $this->assertPageNotContainsText('Ma super source');
    }

    // ************************ Opinion versions **************************************

    /**
     * Go to an opinion with versions.
     *
     * @When I go to an opinion with versions
     */
    public function iGoToAnOpinionWithVersions()
    {
        $this->getSession()->wait(3000, "$('#opinion-page-tabs').length > 0");
        $this->visitPageWithParams('opinion page', self::$opinionWithVersions);
    }

    /**
     * @When I go to a version
     */
    public function iGoToAVersion()
    {
        $this->visitPageWithParams('opinion version page', self::$version);
    }

    /**
     * Go to a version in a closed step.
     *
     * @When I go to an opinion version in a closed step
     */
    public function iGoToAnOpinionVersionInAClosedStep()
    {
        $this->getSession()->wait(3000, "$('#opinion-page-tabs').length > 0");

        $this->visitPageWithParams('opinion version page', self::$versionInClosedStep);
    }

    /**
     * Go to a opinion version with loads of votes.
     *
     * @When I go to an opinion version with loads of votes
     */
    public function iGoToAnOpinionVersionWithLoadsOfVote()
    {
        $this->visitPageWithParams(
            'opinion version page',
            self::$opinionVersionWithLoadsOfVotes,
            'opinion-page-tabs'
        );
    }

    /**
     * I should not see the delete version button.
     *
     * @Then I should not see the delete version button
     */
    public function iShouldNotSeeTheDeleteVersionButton()
    {
        $buttonSelector = $this->navigationContext
            ->getPage('opinion version page')
            ->getDeleteButtonSelector();
        $this->assertElementNotOnPage($buttonSelector);
    }

    /**
     * I click the delete version button.
     *
     * @When I click the delete version button
     */
    public function iClickTheDeleteVersionButton()
    {
        $link = 'a.btn.btn-danger[href*="/delete"]';
        $this->getSession()->wait(3000, "$('${link}').length > 0");
        $this->navigationContext->getPage('opinion version page')->clickDeleteButton();
    }

    /**
     * I confirm version deletion.
     *
     * @When I confirm version deletion
     */
    public function iConfirmVersionDeletion()
    {
        $this->getSession()->wait(3000, "$('#confirm-opinion-delete').length > 0");
        $this->navigationContext->getPage('opinion version page')->confirmDeletion();
    }

    /**
     * I should not see my version anymore.
     *
     * @Then I should not see my version anymore
     */
    public function iShouldNotSeeMyVersionAnymore()
    {
        $this->iWait(1);
        $this->assertPageNotContainsText('Modification 1');
    }

    /**
     * I click the show all opinion version votes button.
     *
     * @When I click the show all opinion version votes button
     */
    public function iClickTheShowAllOpinionVersionVotesButton()
    {
        $this->getSession()->wait(3000, "$('#opinion-votes-show-all').length > 0");
        $this->navigationContext->getPage('opinion version page')->clickShowAllVotesButton();
    }

    /**
     * I should see all opinion version votes.
     *
     * @Then I should see all opinion version votes
     */
    public function iShouldSeeAllOpinionVersionVotes()
    {
        $votesInModalSelector = $this->navigationContext
            ->getPage('opinion version page')
            ->getVotesInModalSelector();
        $this->assertNumElements(49, $votesInModalSelector);
    }

    protected function opinionPageIsOpen()
    {
        return $this->navigationContext->getPage('opinion page')->isOpen(self::$opinion);
    }

    protected function opinionPageInClosedStepIsOpen()
    {
        return $this->navigationContext
            ->getPage('opinion page')
            ->isOpen(self::$opinionInClosedStep);
    }

    protected function opinionWithNoSourcesPageIsOpen()
    {
        return $this->navigationContext
            ->getPage('opinion page')
            ->isOpen(self::$opinionWithNoSources);
    }

    protected function clickArgumentVoteButtonWithLabel($label)
    {
        $page = $this->getCurrentPage();
        $buttonLabel = $page->getArgumentVoteButtonLabel();
        Assert::assertEquals(
            $label,
            $buttonLabel,
            'Incorrect button label ' . $buttonLabel . ' on argument vote button.'
        );
        $page->clickArgumentVoteButton();
        $this->iWait(2);
    }

    // ************************************** Sources ***************************************************

    protected function clickSourceVoteButtonWithLabel($label)
    {
        $page = $this->getCurrentPage();
        $buttonLabel = $page->getSourceVoteButtonLabel();
        Assert::assertEquals(
            $label,
            $buttonLabel,
            'Incorrect button label ' . $buttonLabel . ' on source vote button.'
        );
        $page->clickSourceVoteButton();
        $this->iWait(2);
    }

    protected function versionPageIsOpen()
    {
        return $this->navigationContext->getPage('opinion version page')->isOpen(self::$version);
    }

    protected function versionPageInClosedStepIsOpen()
    {
        return $this->navigationContext
            ->getPage('opinion version page')
            ->isOpen(self::$versionInClosedStep);
    }
}
