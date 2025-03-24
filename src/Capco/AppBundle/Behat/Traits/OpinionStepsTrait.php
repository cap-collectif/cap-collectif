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
        'opinionTypeSlug' => 'titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-1',
    ];
    protected static $opinionWithLoadsOfVotes = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-2',
    ];

    protected static $version = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-1',
        'versionSlug' => 'modification-1',
    ];
    protected static $opinionVersionWithLoadsOfVotes = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-1',
        'versionSlug' => 'modification-2',
    ];

    protected static $versionWithLoadsOfVotes = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques',
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

    protected static $rankingStepWithOpinions = [
        'projectSlug' => 'croissance-innovation-disruption',
        'stepSlug' => 'classement-des-propositions-et-modifications',
    ];

    protected static $versionEditable = [
        'projectSlug' => 'project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement',
        'stepSlug' => 'etape-participation-continue',
        'opinionTypeSlug' => 'premiere-section-encore-un-sous-titre',
        'opinionSlug' => 'opinion-endless',
        'versionSlug' => 'modification-16',
    ];

    /**
     * @When I go to an opinion
     */
    public function iGoToAnOpinion()
    {
        $this->visitPageWithParams('opinion page', self::$opinion);
        $this->iWaitTextToAppearOnPage('no-argument-for', '#opinion__arguments--FOR');
    }

    /**
     * @When I go to an opinion in a closed step
     */
    public function iGoToAnOpinionInAClosedStep()
    {
        $this->visitPageWithParams('opinion page', self::$opinionInClosedStep);
    }

    /**
     * @When I go on the arguments tab
     */
    public function iGoOnTheArgumentsTab()
    {
        $page = $this->getCurrentPage();
        $this->waitAndThrowOnFailure(
            5000,
            "$('" . $page->getSelector('arguments tab') . "').length > 0"
        );
        $page->clickArgumentsTab();
        $this->iWait(1);
    }

    /**
     * @When I go on the versions tab
     */
    public function iGoOnTheVersionsTab()
    {
        $page = $this->getCurrentPage();
        $this->waitAndThrowOnFailure(
            3000,
            "$('" . $page->getSelector('versions tab') . "').length > 0"
        );
        $page->clickVersionsTab();
        $this->iWait(1);
    }

    /**
     * @When The first version in list should be :version
     */
    public function theFirstVersionInListShoulBe(string $version)
    {
        $page = $this->getCurrentPage();
        $this->iWait(1);
        $page->checkTopVersion($version);
        $this->iWait(1);
    }

    /**
     * @When I go on the connections tab
     */
    public function iGoOnTheConnectionsTab()
    {
        $page = $this->getCurrentPage();
        $this->waitAndThrowOnFailure(
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
        $this->waitAndThrowOnFailure(
            3000,
            "$('" . $page->getSelector('votes evolution tab') . "').length > 0"
        );
        $page->clickVotesEvolutionTab();
        $this->iWait(1);
    }

    // *************************************** Arguments ******************************************

    public function submitArgumentForTypeWithText($type, $text)
    {
        $this->waitAndThrowOnFailure(3000, "$('#argument-form--FOR textarea').length > 0");
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
        $this->iWaitElementToAppearOnPage('#opinion__arguments--FOR');
        $selector = $this->navigationContext->getPage('opinion page')->getArgumentsYesBoxSelector();
        $this->iShouldSeeOutputInElementWithinTimeoutSeconds('Texte de mon argument', 10, $selector);
    }

    /**
     * @Then I should see my new unpublished argument
     */
    public function iShouldSeeMyNewUnpublishedArgument()
    {
        $selector = $this->navigationContext
            ->getPage('opinion page')
            ->getUnpublishedArgumentsYesBoxSelector()
        ;
        $this->iShouldSeeOutputInElementWithinTimeoutSeconds('Texte de mon argument', 10, $selector);
    }

    /**
     * @Then my argument should have changed
     */
    public function myArgumentShouldHaveChanged()
    {
        $selector = $this->getCurrentPage()->getArgumentsNoBoxSelector();
        $this->iShouldSeeOutputInElementWithinTimeoutSeconds('Je modifie mon argument !', 10, $selector);
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
        $this->waitAndThrowOnFailure(
            5000,
            "$('" . $page->getArgumentVotesCountSelector() . "').length > 0"
        );
        $votesCount = $page->getArgumentVotesCount();
        Assert::assertNotEquals(
            0,
            $votesCount,
            'Argument has no votes from the begining, test will not be conclusive.'
        );
        $page->clickArgumentEditButton();
        $this->waitAndThrowOnFailure(5000, "$('#argument-form #argument-body').length > 0");
        $page->fillArgumentBodyField();
        $this->checkElement('argument-confirm');
        $page->submitArgumentEditForm();
        $this->iWait(1);
    }

    /**
     * @When I edit my argument without confirming my votes lost
     */
    public function iEditMyArgumentwithoutConfirmingMyVotesLost()
    {
        $page = $this->getCurrentPage();
        $this->waitAndThrowOnFailure(
            10000,
            "$('" . $page->getArgumentVotesCountSelector() . "').length > 0"
        );
        $votesCount = $page->getArgumentVotesCount();
        Assert::assertNotEquals(
            0,
            $votesCount,
            'Argument has no votes from the begining, test will not be conclusive.'
        );
        $page->clickArgumentEditButton();
        $this->waitAndThrowOnFailure(10000, "$('#argument-form #argument-body').length > 0");
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
     * @When I delete my argument
     */
    public function iDeleteMyArgument()
    {
        $page = $this->getCurrentPage();

        $this->waitAndThrowOnFailure(
            5000,
            '$("' . $page->getArgumentDeleteButtonSelector() . '").length > 0'
        );
        $page->clickArgumentDeleteButton();

        $this->waitAndThrowOnFailure(
            5000,
            '$("' . $page->getArgumentConfirmDeletionButtonSelector() . '").length > 0'
        );
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
        $this->waitAndThrowOnFailure(
            15000,
            "$('" . $page->getArgumentVoteButtonSelector() . "').length > 0"
        );
        $wantedVotesCount = $page->getArgumentVotesCount() + 1;
        $this->clickArgumentVoteButtonWithLabel('global.ok');
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
        $this->waitAndThrowOnFailure(
            7000,
            "$('" . $page->getArgumentVoteButtonSelector() . "').length > 0"
        );
        $wantedVotesCount = $page->getArgumentVotesCount() - 1;
        $this->clickArgumentVoteButtonWithLabel('global.cancel');
        $newVotesCount = $page->getArgumentVotesCount();
        Assert::assertEquals(
            $wantedVotesCount,
            $newVotesCount,
            'Argument votes number should be decreased by 1.'
        );
    }

    /**
     * @When I click the argument vote button
     */
    public function iClickTheArgumentVoteButton()
    {
        $page = $this->getCurrentPage();
        $this->waitAndThrowOnFailure(
            7000,
            "$('" . $page->getArgumentVoteButtonSelector() . "').length > 0"
        );
        $this->clickArgumentVoteButtonWithLabel('global.ok');
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
        $this->waitAndThrowOnFailure(
            7000,
            "$('" . $page->getArgumentVoteButtonSelector($inClosedStep) . "').length > 0"
        );
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
        $this->waitAndThrowOnFailure(
            3000,
            "$('#report-argument-QXJndW1lbnQ6YXJndW1lbnQx-button').length > 0"
        );
        $this->getCurrentPage()->clickArgumentReportButton();
    }

    /**
     * @Then the create opinion button should be disabled
     */
    public function theCreateOpinionButtonShouldBeDisabled()
    {
        $page = $this->getCurrentPage();
        $this->waitAndThrowOnFailure(3000, "$('#btn-add--les-causes').length > 0");
        $button = $page->find('css', '#btn-add--les-causes');
        Assert::assertTrue($button->hasAttribute('disabled'));
    }

    // ************************ Opinion versions **************************************

    /**
     * @When I go to a version
     */
    public function iGoToAVersion()
    {
        $this->visitPageWithParams('opinion version page', self::$version);
    }

    /**
     * @When I go to an editable version
     */
    public function iGoToAnEditableVersion()
    {
        $this->visitPageWithParams('opinion version page', self::$versionEditable);
    }

    /**
     * @When I go to an opinion version in a closed step
     */
    public function iGoToAnOpinionVersionInAClosedStep()
    {
        $this->visitPageWithParams('opinion version page', self::$versionInClosedStep);
    }

    /**
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
            ->getDeleteButtonSelector()
        ;
        $this->assertElementNotOnPage($buttonSelector);
    }

    /**
     * @When I click the delete version button
     */
    public function iClickTheDeleteVersionButton()
    {
        $this->waitAndThrowOnFailure(5000, "$('#opinion-delete').length > 0");
        $this->navigationContext->getPage('opinion version page')->clickDeleteButton();
    }

    /**
     * @When I click the edit version button
     */
    public function iClickTheEditVersionButton()
    {
        $this->waitAndThrowOnFailure(3000, "$('#opinion-version-edit-button').length > 0");
        $this->navigationContext->getPage('opinion version page')->clickEditButton();
    }

    /**
     * @Then I check the checkbox to confirm
     */
    public function iCheckTheCheckboxToConfirm()
    {
        $this->checkElement('opinion_check');
    }

    /**
     * @Then I check the checkbox to confirm version
     */
    public function iCheckTheCheckboxToConfirmVersion()
    {
        $this->checkElement('confirm-opinion-version');
    }

    /**
     * @When I fill the edit version form
     */
    public function iFillTheEditVersionForm()
    {
        $this->waitAndThrowOnFailure(3000, "$('#opinion-version-edit').length > 0");

        $this->fillField('title', 'Updated title');

        $this->fillField('version-body', '<p>Updated body</p>');

        $this->fillField('version-comment', '<p>Updated comment</p>');
    }

    /**
     * @When I confirm version deletion
     */
    public function iConfirmVersionDeletion()
    {
        $this->waitAndThrowOnFailure(3000, "$('#confirm-opinion-delete').length > 0");
        $this->navigationContext->getPage('opinion version page')->confirmDeletion();
        $this->iWaitElementToDisappearOnPage('#confirm-opinion-delete');
    }

    /**
     * @Then I should not see my version anymore
     */
    public function iShouldNotSeeMyVersionAnymore()
    {
        $this->iWaitElementToAppearOnPage('#versions-list', 20);
        $this->assertPageNotContainsText('Modification 1');
    }

    /**
     * @When I click the show all opinion version votes button
     */
    public function iClickTheShowAllOpinionVersionVotesButton()
    {
        $this->waitAndThrowOnFailure(10000, "$('#opinion-votes-show-all').length > 0");
        $this->navigationContext->getPage('opinion version page')->clickShowAllVotesButton();
        $this->iWait(1);
    }

    /**
     * @When I click the reporting opinion version button
     */
    public function iClickTheReportingOpinionVersionButton()
    {
        $this->iWait(3);
        $this->navigationContext->getPage('opinion version page')->clickReportButton();
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
            ->getVotesInModalSelector()
        ;
        $this->assertNumElements(50, $votesInModalSelector);
    }

    protected function opinionPageIsOpen()
    {
        return $this->navigationContext->getPage('opinion page')->isOpen(self::$opinion);
    }

    protected function opinionPageInClosedStepIsOpen()
    {
        return $this->navigationContext
            ->getPage('opinion page')
            ->isOpen(self::$opinionInClosedStep)
        ;
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
        $this->iWait(5);
    }

    protected function versionPageIsOpen()
    {
        return $this->navigationContext->getPage('opinion version page')->isOpen(self::$version);
    }

    protected function versionPageInClosedStepIsOpen()
    {
        return $this->navigationContext
            ->getPage('opinion version page')
            ->isOpen(self::$versionInClosedStep)
        ;
    }
}
