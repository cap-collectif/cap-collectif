<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Gherkin\Node\TableNode;

trait ProposalStepsTrait
{
    protected static $collectStepOpenParams = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'collecte-des-propositions',
    ];
    protected static $collectStepOpenPrivateParams = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'collecte-des-propositions-privee',
    ];
    protected static $collectStepClosedParams = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'collecte-des-propositions-fermee',
    ];
    protected static $votesDetailsPageParams = [
        'projectSlug' => 'budget-participatif-rennes',
    ];
    protected static $selectionStepWithSimpleVoteParams = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'selection',
    ];
    protected static $selectionStepWithBudgetVoteParams = [
        'projectSlug' => 'projet-avec-budget',
        'stepSlug' => 'selection-avec-vote-selon-le-budget',
    ];
    protected static $selectionStepNotYetOpen = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'selection-a-venir',
    ];
    protected static $selectionStepClosed = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'fermee',
    ];
    protected static $proposalWithSimpleVoteParams = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'collecte-des-propositions',
        'proposalSlug' => 'renovation-du-gymnase',
    ];
    protected static $proposalWithBudgetVoteParams = [
        'projectSlug' => 'projet-avec-budget',
        'stepSlug' => 'collecte-des-propositions-1',
        'proposalSlug' => 'proposition-pas-chere',
    ];
    protected static $proposalNotYetVotable = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'collecte-des-propositions',
        'proposalSlug' => 'proposition-pas-encore-votable',
    ];
    protected static $proposalNotVotableAnymore = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'collecte-des-propositions',
        'proposalSlug' => 'proposition-plus-votable',
    ];

    // ********************************* Proposals *********************************************

    /**
     * Go to an open collect step page.
     *
     * @When I go to an open collect step
     */
    public function iGoToAnOpenCollectStep()
    {
        $this->visitPageWithParams('collect page', self::$collectStepOpenParams);
    }

    /**
     * Go to a private open collect step page.
     *
     * @When I go to a private open collect step
     */
    public function iGoToAPrivateOpenCollectStep()
    {
        $this->visitPageWithParams('collect page', self::$collectStepOpenPrivateParams);
    }

    protected function openCollectStepIsOpen()
    {
        return $this->navigationContext
            ->getPage('collect page')
            ->isOpen(self::$collectStepOpenParams)
            ;
    }

    /**
     * Go to a closed collect step page.
     *
     * @When I go to a closed collect step
     */
    public function iGoToAClosedCollectStep()
    {
        $this->visitPageWithParams('collect page', self::$collectStepClosedParams);
    }

    protected function closedCollectStepIsOpen()
    {
        return $this->navigationContext
            ->getPage('collect page')
            ->isOpen(self::$collectStepClosedParams)
            ;
    }

    /**
     * Go to a proposal page.
     *
     * @When I go to a proposal
     */
    public function iGoToAProposal()
    {
        $this->visitPageWithParams('proposal page', self::$proposalWithSimpleVoteParams);
        $this->getSession()->wait(5000, "document.body.innerHTML.toString().indexOf('On va en faire un beau gymnase, promis :)') > -1");
    }

    protected function proposalPageIsOpen()
    {
        return $this->navigationContext->getPage('proposal page')->isOpen(self::$proposalWithSimpleVoteParams);
    }

    /**
     * Go to a proposal not yet votable.
     *
     * @When I go to a proposal not yet votable
     */
    public function iGoToAProposalNotYetVotable()
    {
        $this->visitPageWithParams('proposal page', self::$proposalNotYetVotable);
    }

    protected function proposalNotYetVotablePageIsOpen()
    {
        return $this->navigationContext->getPage('proposal page')->isOpen(self::$proposalNotYetVotable);
    }

    /**
     * Go to a proposal not votable anymore.
     *
     * @When I go to a proposal not votable anymore
     */
    public function iGoToAProposalNotVotableAnymore()
    {
        $this->visitPageWithParams('proposal page', self::$proposalNotVotableAnymore);
    }

    protected function proposalNotVotableAnymoreIsOpen()
    {
        return $this->navigationContext->getPage('proposal page')->isOpen(self::$proposalNotVotableAnymore);
    }

    /**
     * There should be nb proposals.
     *
     * @Then there should be :nb proposals
     */
    public function thereShouldBeNbProposals($nb)
    {
        $this->assertPageContainsText($nb.$nb > 1 ? ' propositions' : 'proposition');
        $proposalSelector = $this->getCurrentPage()->getProposalSelector();
        $this->assertNumElements($nb, $proposalSelector);
    }

    /**
     * I change the proposals theme filter.
     *
     * @When I change the proposals theme filter
     */
    public function iChangeTheProposalsThemeFilter()
    {
        $this->selectOption('proposal-filter-themes', 'Justice');
        $this->iWait(2);
    }

    /**
     * I sort proposals by date.
     *
     * @When I sort proposals by date
     */
    public function iSortProposalsByDate()
    {
        $this->getCurrentPage()->sortByDate();
        $this->iWait(2);
    }

    /**
     * I sort proposals by comments.
     *
     * @When I sort proposals by comments
     */
    public function iSortProposalsByComments()
    {
        $this->getCurrentPage()->sortByComments();
        $this->iWait(1);
    }

    /**
     * I search for proposals with terms.
     *
     * @When I search for proposals with terms :terms
     */
    public function iSearchForProposalsWithTerms($terms)
    {
        $this->fillField('proposal-search-input', $terms);
        $this->pressButton('proposal-search-button');
        $this->iWait(1);
    }

    protected function proposalBeforeProposal($proposal1, $proposal2)
    {
        $this->element1ShouldBeBeforeElement2ForSelector(
            $proposal1,
            $proposal2,
            '.proposal__preview .proposal__title a'
        );
    }

    /**
     * Proposals should be ordered by date.
     *
     * @Then proposals should be ordered by date
     */
    public function proposalsShouldBeOrderedByDate()
    {
        $option = $this->getCurrentPage()->getSelectedSortingOption();
        \PHPUnit_Framework_Assert::assertEquals('last', $option);
        $this->proposalBeforeProposal(
            'Rénovation du gymnase',
            'Ravalement de la façade de la bibliothèque municipale'
        );
    }

    /**
     * Proposals should be ordered randomly.
     *
     * @Then proposals should be ordered randomly
     */
    public function proposalsShouldBeOrderedRandomly()
    {
        $option = $this->getCurrentPage()->getSelectedSortingOption();
        \PHPUnit_Framework_Assert::assertEquals('random', $option);
    }

    /**
     * Proposals should be ordered by comments.
     *
     * @Then proposals should be ordered by comments
     */
    public function proposalsShouldBeOrderedByComments()
    {
        $option = $this->getCurrentPage()->getSelectedSortingOption();
        \PHPUnit_Framework_Assert::assertEquals('comments', $option);
        $this->proposalBeforeProposal(
            'Ravalement de la façade de la bibliothèque municipale',
            'Rénovation du gymnase'
        );
    }

    /**
     * Proposals should be filtered by terms.
     *
     * @Then proposals should be filtered by terms
     */
    public function proposalsShouldBeFilteredByTerms()
    {
        $this->assertPageContainsText('Rénovation du gymnase');
        $this->assertPageContainsText('Installation de bancs sur la place de la mairie');
    }

    /**
     * Proposals should be filtered by theme and terms and sorted by comments.
     *
     * @Then proposals should be filtered by theme and terms and sorted by comments
     */
    public function proposalsShouldBeFilteredByThemeAndTermsAndSortedByComments()
    {
        $option = $this->getCurrentPage()->getSelectedSortingOption();
        \PHPUnit_Framework_Assert::assertEquals('comments', $option);
        $this->assertPageContainsText('Ravalement de la façade de la bibliothèque municipale');
        $this->assertPageContainsText('Installation de bancs sur la place de la mairie');
        $this->proposalBeforeProposal(
            'Ravalement de la façade de la bibliothèque municipale',
            'Installation de bancs sur la place de la mairie'
        );
    }

    /**
     * I click the create proposal button.
     *
     * @Then I click the create proposal button
     */
    public function iClickTheCreateProposalButton()
    {
        $this->navigationContext->getPage('collect page')->clickCreateProposalButton();
        $this->iWait(1);
    }

    /**
     * I should see the proposal private field
     *
     * @Then I should see the proposal private field
     */
    public function iShouldSeeTheProposalPrivateField()
    {
        $this->assertPageContainsText("Visible uniquement par vous et l'administrateur");
        $this->assertPageContainsText("Evaluez l'importance de votre proposition");
        $this->assertPageContainsText("souhaitable");
    }

    /**
     * I should not see the proposal private field
     *
     * @Then I should not see the proposal private field
     */
    public function iShouldNotSeeTheProposalPrivateField()
    {
        $this->assertPageNotContainsText("Visible uniquement par vous et l'administrateur");
        $this->assertPageNotContainsText("Evaluez l'importance de votre proposition");
    }

    /**
     * I fill the proposal form.
     *
     * @When I fill the proposal form
     */
    public function iFillTheProposalForm()
    {
        $this->fillProposalForm();
    }

    /**
     * I fill the proposal form with a theme.
     *
     * @When I fill the proposal form with a theme
     */
    public function iFillTheProposalFormWithATheme()
    {
        $this->fillProposalForm(true);
    }

    /**
     * I fill the proposal form without required response.
     *
     * @When I fill the proposal form without required response
     */
    public function iFillTheProposalFormWithoutRequiredResponse()
    {
        $this->fillProposalForm(false, false);
    }

    protected function fillProposalForm($theme = false, $requiredResponse = 'Réponse à la question 2')
    {
        $tableNode = new TableNode([
            ['proposal_title', 'Nouvelle proposition créée'],
            ['proposal_body', 'Description de ma proposition'],
            ['proposal_custom-1', 'Réponse à la question 1'],
        ]);
        if ($requiredResponse !== false) {
            $this->fillField('proposal_custom-3', $requiredResponse);
        }
        $this->fillFields($tableNode);
        $this->selectOption('proposal_district', 'Beaulieu');
        $this->selectOption('proposal_category', 'Politique');
        if ($theme) {
            $this->selectOption('proposal_theme', 'Justice');
        }
    }

    /**
     * I submit the create proposal form.
     *
     * @When I submit the create proposal form
     */
    public function iSubmitTheCreateProposalForm()
    {
        $this->navigationContext->getPage('collect page')->submitProposalForm();
        $this->iWait(5);
    }

    /**
     * I submit the edit proposal form.
     *
     * @When I submit the edit proposal form
     */
    public function iSubmitTheEditProposalForm()
    {
        $this->navigationContext->getPage('proposal page')->submitEditProposalForm();
        $this->iWait(2);
    }

    /**
     * The create proposal button should be disabled.
     *
     * @Then the create proposal button should be disabled
     */
    public function theCreateProposalButtonShouldBeDisabled()
    {
        $button = $this->navigationContext->getPage('collect page')->getCreateProposalButton();
        \PHPUnit_Framework_Assert::assertTrue($button->hasAttribute('disabled'));
    }

    /**
     * I should see my new proposal.
     *
     * @Then I should see my new proposal
     */
    public function iShouldSeMyNewProposal()
    {
        $this->assertPageContainsText('Nouvelle proposition créée');
    }

    /**
     * I click the edit proposal button.
     *
     * @Then I click the edit proposal button
     */
    public function iClickTheEditProposalButton()
    {
        $this->navigationContext->getPage('proposal page')->clickEditProposalButton();
        $this->iWait(1);
    }

    /**
     * I change the proposal title.
     *
     * @When I change the proposal title
     */
    public function iChangeTheProposalTitle()
    {
        $this->fillField('proposal_title', 'Nouveau titre');
    }

    /**
     * The proposal title should have change.
     *
     * @Then the proposal title should have changed
     */
    public function theProposalTitleShouldHaveChanged()
    {
        $this->assertPageNotContainsText('Rénovation du gymnase');
        $this->assertPageContainsText('Nouveau titre');
    }

    /**
     * I should not see the edit proposal button.
     *
     * @Then I should not see the edit proposal button
     */
    public function iShouldNotSeeTheEditProposalButton()
    {
        $proposalButtonsSelector = $this->navigationContext->getPage('proposal page')->getProposalButtonsSelector();
        $this->assertElementNotContainsText($proposalButtonsSelector, 'Modifier');
    }

    /**
     * I click the delete proposal button.
     *
     * @Then I click the delete proposal button
     */
    public function iClickTheDeleteProposalButton()
    {
        $this->navigationContext->getPage('proposal page')->clickDeleteProposalButton();
        $this->iWait(1);
    }

    /**
     * I confirm proposal deletion.
     *
     * @Then I confirm proposal deletion
     */
    public function iConfirmProposalDeletion()
    {
        $this->navigationContext->getPage('proposal page')->clickConfirmDeleteProposalButton();
        $this->iWait(3);
        $this->currentPage = 'collect page';
    }

    /**
     * I should not see my proposal anymore.
     *
     * @Then I should not see my proposal anymore
     */
    public function iShouldNotSeeMyProposalAnymore()
    {
        $this->assertPageNotContainsText('Rénovation du gymnase');
    }

    /**
     * I should not see the delete proposal button.
     *
     * @Then I should not see the delete proposal button
     */
    public function iShouldNotSeeTheDeleteProposalButton()
    {
        $proposalButtonsSelector = $this->navigationContext->getPage('proposal page')->getProposalButtonsSelector();
        $this->assertElementNotContainsText($proposalButtonsSelector, 'Supprimer');
    }

    /**
     * I click the report proposal button.
     *
     * @Then I click the report proposal button
     */
    public function iClickTheReportProposalButton()
    {
        $this->navigationContext->getPage('proposal page')->clickReportProposalButton();
        $this->iWait(1);
    }

    /**
     * I should see the proposal likers.
     *
     * @Then I should see the proposal likers
     */
    public function iShouldSeeTheProposalLikers()
    {
        $this->assertPageContainsText('2 coups de coeur');
    }

    /**
     * I click the share proposal button.
     *
     * @When I click the share proposal button
     */
    public function iClickTheShareProposalButton()
    {
        $this->navigationContext->getPage('proposal page')->clickShareButton();
        $this->iWait(1);
    }

    // ********************************** Proposal votes *************************************************

    /**
     * Go to the votes details page.
     *
     * @When I go to the votes details page
     */
    public function iGoToTheVotesDetailsPage()
    {
        $this->visitPageWithParams('project user votes page', self::$votesDetailsPageParams);
    }

    protected function votesDetailsPageIsOpen()
    {
        return $this->navigationContext->getPage('project user votes page')->isOpen();
    }

    /**
     * Go to a selection step page with simple vote enabled.
     *
     * @When I go to a selection step with simple vote enabled
     */
    public function iGoToASelectionStepWithSimpleVoteEnabled()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepWithSimpleVoteParams);
    }

    protected function selectionStepWithSimpleVoteIsOpen()
    {
        return $this->navigationContext
            ->getPage('selection page')
            ->isOpen(self::$selectionStepWithSimpleVoteParams)
            ;
    }

    /**
     * Go to a selection step page with budget vote enabled.
     *
     * @When I go to a selection step with budget vote enabled
     */
    public function iGoToASelectionStepWithBudgetVoteEnabled()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepWithBudgetVoteParams);
    }

    protected function selectionStepWithBudgetVoteIsOpen()
    {
        return $this->navigationContext
            ->getPage('selection page')
            ->isOpen(self::$selectionStepWithBudgetVoteParams)
            ;
    }

    /**
     * Go to a selection step not yet open.
     *
     * @When I go to a selection step not yet open
     */
    public function iGoToASelectionStepNotYetOpen()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepNotYetOpen);
    }

    protected function selectionStepNotYetOpenIsOpen()
    {
        return $this->navigationContext
            ->getPage('selection page')
            ->isOpen(self::$selectionStepNotYetOpen)
            ;
    }

    /**
     * Go to a closed selection step.
     *
     * @When I go to a closed selection step
     */
    public function iGoToAClosedSelectionStep()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepClosed);
    }

    protected function selectionStepClosedIsOpen()
    {
        return $this->navigationContext
            ->getPage('selection page')
            ->isOpen(self::$selectionStepClosed)
            ;
    }

    /**
     * Go to a proposal page with budget vote enabled.
     *
     * @When I go to a proposal with budget vote enabled
     */
    public function iGoToAProposalWithBudgetVoteEnabled()
    {
        $this->visitPageWithParams('proposal page', self::$proposalWithBudgetVoteParams);
    }

    protected function proposalPageWithBudgetVoteIsOpen()
    {
        return $this->navigationContext->getPage('proposal page')->isOpen(self::$proposalWithBudgetVoteParams);
    }

    protected function getProposalId()
    {
        if ($this->proposalPageIsOpen() || $this->selectionStepWithSimpleVoteIsOpen()) {
            return 2;
        }
        if ($this->proposalPageWithBudgetVoteIsOpen() || $this->selectionStepWithBudgetVoteIsOpen()) {
            return 8;
        }
        if ($this->selectionStepNotYetOpenIsOpen() || $this->proposalNotYetVotablePageIsOpen()) {
            return 10;
        }
        if ($this->selectionStepClosedIsOpen() || $this->proposalNotVotableAnymoreIsOpen()) {
            return 11;
        }

        return;
    }

    /**
     * I should have nb votes.
     *
     * @Then I should have :nb votes
     */
    public function iShouldHaveNbVotes($nb)
    {
        $count = $this->navigationContext->getPage('project user votes page')->countVotes();
        expect($count == $nb);
    }

    /**
     * The proposal should have nb votes.
     *
     * @Given the proposal has :nb votes
     * @Then the proposal should have :nb votes
     */
    public function theProposalShouldHaveNbVotes($nb)
    {
        $votesCount = $this->getCurrentPage()->getVotesCount($this->getProposalId());
        \PHPUnit_Framework_Assert::assertEquals($nb, $votesCount, 'Incorrect votes number '.$votesCount.' for proposal.');
    }

    /**
     * The proposal should have nb comments.
     *
     * @Given the proposal has :nb comments
     * @Then the proposal should have :nb comments
     */
    public function theProposalShouldHaveNbComments($nb)
    {
        $commentsCount = $this->getCurrentPage()->getCommentsCount($this->getProposalId());
        \PHPUnit_Framework_Assert::assertEquals($nb, $commentsCount, 'Incorrect comments number '.$commentsCount.' for proposal.');
    }

    /**
     * I remove the first vote.
     *
     * @When I remove the first vote
     */
    public function iRemoveTheFirstVote()
    {
        $this->navigationContext->getPage('project user votes page')->removeFirstVote();
        $this->iWait(5);
    }

    protected function clickProposalVoteButtonWithLabel($label)
    {
        $page = $this->getCurrentPage();
        $proposalId = $this->getProposalId();
        $buttonLabel = $page->getVoteButtonLabel($proposalId);
        \PHPUnit_Framework_Assert::assertEquals($label, $buttonLabel, 'Incorrect button label '.$buttonLabel.' on proposal vote button.');
        $page->clickVoteButton($proposalId);
        $this->iWait(2);
    }

    /**
     * I click the proposal vote button.
     *
     * @When I click the proposal vote button
     */
    public function iClickTheProposalVoteButton()
    {
        $this->clickProposalVoteButtonWithLabel('Voter pour');
    }

    /**
     * I click the proposal unvote button.
     *
     * @When I click the proposal unvote button
     */
    public function iClickTheProposalUnvoteButton()
    {
        $this->clickProposalVoteButtonWithLabel('Annuler mon vote');
    }

    /**
     * I fill the proposal vote form.
     *
     * @When I fill the proposal vote form
     */
    public function iFillTheProposalVoteForm()
    {
        $tableNode = new TableNode([
            ['proposal-vote__username', 'test'],
            ['proposal-vote__email', 'test@coucou.fr'],
        ]);
        $this->fillFields($tableNode);
    }

    /**
     * I fill the proposal vote form with already used email.
     *
     * @When I fill the proposal vote form with already used email
     */
    public function iFillTheProposalVoteFormWithAlreadyUsedEmail()
    {
        $tableNode = new TableNode([
            ['proposal-vote__username', 'test'],
            ['proposal-vote__email', 'cheater@test.com'],
        ]);
        $this->fillFields($tableNode);
    }

    /**
     * I fill the proposal vote form with a registered email.
     *
     * @When I fill the proposal vote form with a registered email
     */
    public function iFillTheProposalVoteFormWithARegisteredEmail()
    {
        $tableNode = new TableNode([
            ['proposal-vote__username', 'test'],
            ['proposal-vote__email', 'user@test.com'],
        ]);
        $this->fillFields($tableNode);
    }

    /**
     * I add a proposal vote comment.
     *
     * @When I add a proposal vote comment
     */
    public function iAddAProposalVoteComment()
    {
        $this->fillField('proposal-vote__comment', 'Coucou !');
    }

    /**
     * I check the proposal vote private checkbox.
     *
     * @When I check the proposal vote private checkbox
     */
    public function iCheckTheProposalVotePrivateCheckbox()
    {
        $this->checkOption('proposal-vote__private');
    }

    /**
     * I submit the proposal vote form.
     *
     * @When I submit the proposal vote form
     */
    public function iSubmitTheProposalVoteForm()
    {
        $page = $this->getCurrentPage()->submitProposalVoteForm();
        $this->iWait(4);
    }

    /**
     * The proposal vote button must be disabled.
     *
     * @Then the proposal vote button must be disabled
     */
    public function theProposalVoteButtonMustBeDisabled()
    {
        $button = $this->getCurrentPage()->getVoteButton($this->getProposalId());
        \PHPUnit_Framework_Assert::assertTrue(
            $button->hasClass('disabled') || $button->hasAttribute('disabled'),
            'The proposal vote button is not disabled neither it has class "disabled".'
        );
    }

    /**
     * I should see the proposal vote tooltip.
     *
     * @When I should see the proposal vote tooltip
     */
    public function iShouldSeeTheProposalVoteTooltip()
    {
        $this->navigationContext->getPage('selection page')->hoverOverVoteButton($this->getProposalId());
        $this->iWait(1);
        $this->assertPageContainsText('Pas assez de crédits. Désélectionnez un projet ou sélectionnez un projet moins coûteux.');
    }

    protected function assertProposalCommentsContains($text)
    {
        $firstVoteSelector = $this->navigationContext->getPage('proposal page')->getCommentsListSelector();
        $this->assertElementContainsText($firstVoteSelector, $text);
    }

    /**
     * I should see my comment in the proposal comments list.
     *
     * @Then I should see my comment in the proposal comments list
     */
    public function iShouldSeeMyCommentInTheProposalCommentsList()
    {
        $this->assertProposalCommentsContains('Coucou !');
    }

    protected function assertFirstProposalVoteContains($text)
    {
        $firstVoteSelector = $this->navigationContext->getPage('proposal page')->getFirstVoteSelector();
        $this->assertElementContainsText($firstVoteSelector, $text);
    }

    protected function assertFirstProposalVoteNotContains($text)
    {
        $firstVoteSelector = $this->navigationContext->getPage('proposal page')->getFirstVoteSelector();
        $this->assertElementNotContainsText($firstVoteSelector, $text);
    }

    /**
     * I should see my vote in the proposal votes list.
     *
     * @Then I should see my vote in the proposal votes list
     */
    public function iShouldSeeMyVoteInTheProposalVotesList()
    {
        $this->assertFirstProposalVoteContains('user');
    }

    /**
     * I should not see my vote in the proposal votes list.
     *
     * @Then I should not see my vote in the proposal votes list
     */
    public function iShouldNotSeeMyVoteInTheProposalVotesList()
    {
        $this->assertFirstProposalVoteNotContains('user');
    }

    /**
     * I should see my anonymous vote in the proposal votes list.
     *
     * @Then I should see my anonymous vote in the proposal votes list
     */
    public function iShouldSeeMyAnonymousVoteInTheProposalVotesList()
    {
        $this->assertFirstProposalVoteContains('Anonyme');
    }

    /**
     * I should see my not logged in vote in the proposal votes list.
     *
     * @Then I should see my not logged in vote in the proposal votes list
     */
    public function iShouldSeeMyNotLoggedInVoteInTheProposalVotesList()
    {
        $this->assertFirstProposalVoteContains('test');
    }

    /**
     * @When I go to the proposal votes tab
     */
    public function iGoToTheProposalVotesTab()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(3000, "$('".$page->getSelector('votes tab')."').length > 0");
        $page->clickVotesTab();
        $this->iWait(1);
    }

    /**
     * @When I go to the proposal comments tab
     */
    public function iGoToTheProposalCommentsTab()
    {
        $page = $this->getCurrentPage();
        $this->getSession()->wait(3000, "$('".$page->getSelector('comments tab')."').length > 0");
        $page->clickCommentsTab();
        $this->iWait(1);
    }
}
