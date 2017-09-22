<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Gherkin\Node\TableNode;
use FilesystemIterator;

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

    protected static $selectionStepOpenParams = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'selection',
    ];
    protected static $votesDetailsPageParams = [
        'projectSlug' => 'budget-participatif-rennes',
    ];
    protected static $selectionStepWithSimpleVoteParams = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'selection',
    ];
    protected static $selectionStepWithBudgetVoteParams = [
        'projectSlug' => 'depot-avec-selection-vote-budget',
        'stepSlug' => 'selection-avec-vote-selon-le-budget',
    ];
    protected static $selectionStepWithBudgetVoteLimitedParams = [
        'projectSlug' => 'budget-avec-vote-limitte',
        'stepSlug' => 'selection-avec-vote-budget-limite',
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
        'projectSlug' => 'depot-avec-selection-vote-budget',
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

    /** @var array */
    protected $currentCollectsStep = [];

    // ********************************* Proposals *********************************************

    /**
     * @When I go to an open collect step
     */
    public function iGoToAnOpenCollectStep()
    {
        $this->visitPageWithParams('collect page', self::$collectStepOpenParams);
    }

    /**
     * @When I go to a selection step
     */
    public function iGoToASelectionStep()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepOpenParams);
    }

    /**
     * @When I go to a private open collect step
     */
    public function iGoToAPrivateOpenCollectStep()
    {
        $this->visitPageWithParams('collect page', self::$collectStepOpenPrivateParams);
    }

    /**
     * @When I go to a closed collect step
     */
    public function iGoToAClosedCollectStep()
    {
        $this->visitPageWithParams('collect page', self::$collectStepClosedParams);
    }

    /**
     * @When I go to a proposal
     */
    public function iGoToAProposal()
    {
        $this->visitPageWithParams('proposal page', self::$proposalWithSimpleVoteParams);
        $this->getSession()->wait(5000, "document.body.innerHTML.toString().indexOf('On va en faire un beau gymnase, promis :)') > -1");
    }

    /**
     * @When I go to a proposal not yet votable
     */
    public function iGoToAProposalNotYetVotable()
    {
        $this->visitPageWithParams('proposal page', self::$proposalNotYetVotable);
    }

    /**
     * @When I go to a proposal not votable anymore
     */
    public function iGoToAProposalNotVotableAnymore()
    {
        $this->visitPageWithParams('proposal page', self::$proposalNotVotableAnymore);
    }

    /**
     * @Then there should be :nb proposals
     */
    public function thereShouldBeNbProposals(int $nb)
    {
        $this->assertPageContainsText($nb . $nb > 1 ? ' propositions' : 'proposition');
        $proposalSelector = $this->getCurrentPage()->getProposalSelector();
        $this->assertNumElements($nb, $proposalSelector);
    }

    /**
     * @When I change the proposals theme filter
     */
    public function iChangeTheProposalsThemeFilter()
    {
        $this->selectOption('proposal-filter-themes', 'Justice');
        $this->iWait(2);
    }

    /**
     * @When I sort proposals by date
     */
    public function iSortProposalsByDate()
    {
        $this->getCurrentPage()->sortByDate();
        $this->iWait(2);
    }

    /**
     * @When I sort proposals by comments
     */
    public function iSortProposalsByComments()
    {
        $this->getCurrentPage()->sortByComments();
        $this->iWait(1);
    }

    /**
     * @When I search for proposals with terms :terms
     *
     * @param mixed $terms
     */
    public function iSearchForProposalsWithTerms($terms)
    {
        $this->fillField('proposal-search-input', $terms);
        $this->pressButton('proposal-search-button');
        $this->iWait(1);
    }

    /**
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
     * @Then proposals should be ordered randomly
     */
    public function proposalsShouldBeOrderedRandomly()
    {
        $option = $this->getCurrentPage()->getSelectedSortingOption();
        \PHPUnit_Framework_Assert::assertEquals('random', $option);
    }

    /**
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
     * @Then proposals should be filtered by terms
     */
    public function proposalsShouldBeFilteredByTerms()
    {
        $this->assertPageContainsText('Proposition pas encore votable');
        $this->assertPageContainsText('Proposition plus votable');
    }

    /**
     * @Then proposals should be filtered by theme and terms and sorted by comments
     */
    public function proposalsShouldBeFilteredByThemeAndTermsAndSortedByComments()
    {
        $option = $this->getCurrentPage()->getSelectedSortingOption();
        \PHPUnit_Framework_Assert::assertEquals('comments', $option);
        $this->assertPageContainsText('Proposition pas encore votable');
        $this->assertPageContainsText('Proposition plus votable');
        $this->proposalBeforeProposal(
            'Proposition pas encore votable',
            'Proposition plus votable'
        );
    }

    /**
     * @Then proposals should have no results
     */
    public function proposalsShouldHaveNoResults()
    {
        $this->assertPageContainsText('Aucune proposition');
        $this->assertPageNotContainsText('Relancer le tri aléatoire');
    }

    /**
     * @Then I click the create proposal button
     */
    public function iClickTheCreateProposalButton()
    {
        $this->navigationContext->getPage('collect page')->clickCreateProposalButton();
        $this->iWait(1);
    }

    /**
     * @Then I should see the proposal private field
     */
    public function iShouldSeeTheProposalPrivateField()
    {
        $this->assertPageContainsText("Visible uniquement par vous et l'administrateur");
        $this->assertPageContainsText("Evaluez l'importance de votre proposition");
        $this->assertPageContainsText('souhaitable');
    }

    /**
     * @Then I should not see the proposal private field
     */
    public function iShouldNotSeeTheProposalPrivateField()
    {
        $this->assertPageNotContainsText("Visible uniquement par vous et l'administrateur");
        $this->assertPageNotContainsText("Evaluez l'importance de votre proposition");
    }

    /**
     * @When I fill the proposal form
     */
    public function iFillTheProposalForm()
    {
        $this->fillProposalForm(true);
    }

    /**
     * @When I fill the proposal form with a theme
     */
    public function iFillTheProposalFormWithATheme()
    {
        $this->fillProposalForm(true, true);
    }

    /**
     * @When I fill the proposal form without required response
     */
    public function iFillTheProposalFormWithoutRequiredResponse()
    {
        $this->fillProposalForm(true, false, false);
    }

    /**
     * @When I submit the create proposal form
     */
    public function iSubmitTheCreateProposalForm()
    {
        $this->navigationContext->getPage('collect page')->submitProposalForm();
        $this->iWait(5);
    }

    /**
     * @When I submit the edit proposal form
     */
    public function iSubmitTheEditProposalForm()
    {
        $this->navigationContext->getPage('proposal page')->submitEditProposalForm();
        $this->iWait(2);
    }

    /**
     * @Then the create proposal button should be disabled
     */
    public function theCreateProposalButtonShouldBeDisabled()
    {
        $button = $this->navigationContext->getPage('collect page')->getCreateProposalButton();
        \PHPUnit_Framework_Assert::assertTrue($button->hasAttribute('disabled'));
    }

    /**
     * @Then I should see my new proposal
     */
    public function iShouldSeMyNewProposal()
    {
        $this->assertPageContainsText('Nouvelle proposition créée');
    }

    /**
     * @Then I click the edit proposal button
     */
    public function iClickTheEditProposalButton()
    {
        $this->navigationContext->getPage('proposal page')->clickEditProposalButton();
        $this->iWait(1);
    }

    /**
     * @When I change the proposal title
     */
    public function iChangeTheProposalTitle()
    {
        $this->fillField('proposal_title', 'Nouveau titre');
    }

    /**
     * @Then the proposal title should have changed
     */
    public function theProposalTitleShouldHaveChanged()
    {
        $this->assertPageNotContainsText('Rénovation du gymnase');
        $this->assertPageContainsText('Nouveau titre');
    }

    /**
     * @Then I should not see the edit proposal button
     */
    public function iShouldNotSeeTheEditProposalButton()
    {
        $proposalButtonsSelector = $this->navigationContext->getPage('proposal page')->getProposalButtonsSelector();
        $this->assertElementNotContainsText($proposalButtonsSelector, 'Modifier');
    }

    /**
     * @Then I click the delete proposal button
     */
    public function iClickTheDeleteProposalButton()
    {
        $this->navigationContext->getPage('proposal page')->clickDeleteProposalButton();
        $this->iWait(1);
    }

    /**
     * @Then I confirm proposal deletion
     */
    public function iConfirmProposalDeletion()
    {
        $this->navigationContext->getPage('proposal page')->clickConfirmDeleteProposalButton();
        $this->iWait(3);
        $this->currentPage = 'collect page';
    }

    /**
     * @Then I should not see my proposal anymore
     */
    public function iShouldNotSeeMyProposalAnymore()
    {
        $this->assertPageNotContainsText('Rénovation du gymnase');
    }

    /**
     * @Then I should not see the delete proposal button
     */
    public function iShouldNotSeeTheDeleteProposalButton()
    {
        $proposalButtonsSelector = $this->navigationContext->getPage('proposal page')->getProposalButtonsSelector();
        $this->assertElementNotContainsText($proposalButtonsSelector, 'Supprimer');
    }

    /**
     * @Then I click the report proposal button
     */
    public function iClickTheReportProposalButton()
    {
        $this->navigationContext->getPage('proposal page')->clickReportProposalButton();
        $this->iWait(1);
    }

    /**
     * @Then I should see the proposal likers
     */
    public function iShouldSeeTheProposalLikers()
    {
        $this->assertPageContainsText('2 coups de coeur');
    }

    /**
     * @When I click the share proposal button
     */
    public function iClickTheShareProposalButton()
    {
        $this->navigationContext->getPage('proposal page')->clickShareButton();
        $this->iWait(1);
    }

    // ********************************** Proposal votes *************************************************

    /**
     * @When I go to the votes details page
     */
    public function iGoToTheVotesDetailsPage()
    {
        $this->visitPageWithParams('project user votes page', self::$votesDetailsPageParams);
    }

    /**
     * @When I go to a selection step with simple vote enabled
     */
    public function iGoToASelectionStepWithSimpleVoteEnabled()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepWithSimpleVoteParams);
    }

    /**
     * @When I go to a selection step with budget vote enabled
     */
    public function iGoToASelectionStepWithBudgetVoteEnabled()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepWithBudgetVoteParams);
    }

    /**
     * @When I go to a selection step with budget vote limited enabled
     */
    public function iGoToASelectionStepWithBudgetVoteLimitedEnabled()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepWithBudgetVoteLimitedParams);
    }

    /**
     * @When I go to a selection step not yet open
     */
    public function iGoToASelectionStepNotYetOpen()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepNotYetOpen);
    }

    /**
     * @When I go to a closed selection step
     */
    public function iGoToAClosedSelectionStep()
    {
        $this->visitPageWithParams('selection page', self::$selectionStepClosed);
    }

    /**
     * @When I go to a proposal with budget vote enabled
     */
    public function iGoToAProposalWithBudgetVoteEnabled()
    {
        $this->visitPageWithParams('proposal page', self::$proposalWithBudgetVoteParams);
    }

    /**
     * @Then I should have :nb votes
     */
    public function iShouldHaveNbVotes(int $nb)
    {
        $count = $this->navigationContext->getPage('project user votes page')->countVotes();
        expect($count)->toBe($nb);
    }

    /**
     * @Then proposal :id should be fusioned to proposal :lastId
     */
    public function proposalShouldBeFusioned(int $id, int $lastId)
    {
        $proposal = $this->getRepository('CapcoAppBundle:Proposal')->find($id);
        expect($proposal->getParentConnections()->count())->toBe(1);
        expect($proposal->getParentConnections()->first()->getId())->toBe($lastId);
    }

    /**
     * @Then proposal :id should have author :username
     *
     * @param mixed $id
     * @param mixed $username
     */
    public function proposalShouldHaveAuthor($id, $username)
    {
        $proposal = $this->getRepository('CapcoAppBundle:Proposal')->find($id);
        expect($proposal->getAuthor()->getUsername())->toBe($username);
    }

    /**
     * @Given the proposal has :nb votes
     * @Then the proposal should have :nb votes
     *
     * @param mixed $nb
     */
    public function theProposalShouldHaveNbVotes($nb)
    {
        $this->iWait(2);
        $votesCount = $this->getCurrentPage()->getVotesCount($this->getProposalId());
        \PHPUnit_Framework_Assert::assertEquals($nb, $votesCount, 'Incorrect votes number ' . $votesCount . ' for proposal.');
    }

    /**
     * @Given the proposal has :nb comments
     * @Then the proposal should have :nb comments
     *
     * @param mixed $nb
     */
    public function theProposalShouldHaveNbComments($nb)
    {
        $commentsCount = $this->getCurrentPage()->getCommentsCount($this->getProposalId());
        \PHPUnit_Framework_Assert::assertEquals($nb, $commentsCount, 'Incorrect comments number ' . $commentsCount . ' for proposal.');
    }

    /**
     * @When I remove the first vote
     */
    public function iRemoveTheFirstVote()
    {
        $this->navigationContext->getPage('project user votes page')->removeFirstVote();
        $this->iWait(5);
    }

    /**
     * @When I click the proposal vote button
     * @When I click the proposal :id vote button
     */
    public function iClickTheProposalVoteButton(int $id = null)
    {
        $this->clickProposalVoteButtonWithLabel('Voter pour', $id);
    }

    /**
     * @When I click the proposal unvote button
     */
    public function iClickTheProposalUnvoteButton()
    {
        $this->clickProposalVoteButtonWithLabel('Annuler mon vote');
    }

    /**
     * @When I click the reload random button
     */
    public function iClickTheReloadRandomButton()
    {
        $this->clickProposalVoteButtonWithLabel('Relancer le tri aléatoire');
    }

    /**
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
     * @Then selection :selectionStepId :proposalId should have status :statusId
     */
    public function proposalSelectionShouldHaveStatus(string $selectionStepId, int $proposalId, int $statusId)
    {
        $selection = $this->getRepository('CapcoAppBundle:Selection')->findOneBy([
          'selectionStep' => $selectionStepId,
          'proposal' => $proposalId,
        ]);
        expect($selection->getStatus()->getId())->toBe($statusId);
        $this->getEntityManager()->clear();
    }

    /**
     * @Then selection :selectionStepId :proposalId should have no status
     */
    public function proposalSelectionShouldHaveNoStatus(string $selectionStepId, int $proposalId)
    {
        $selection = $this->getRepository('CapcoAppBundle:Selection')->findOneBy([
          'selectionStep' => $selectionStepId,
          'proposal' => $proposalId,
        ]);
        expect($selection->getStatus())->toBe(null);
        $this->getEntityManager()->clear();
    }

    /**
     * @Then proposal :proposalId should have status :statusId
     */
    public function proposalShouldHaveStatus(int $proposalId, int $statusId)
    {
        $proposal = $this->getRepository('CapcoAppBundle:Proposal')->find($proposalId);
        expect($proposal->getStatus()->getId())->toBe($statusId);
        $this->getEntityManager()->clear();
    }

    /**
     * @Then proposal :proposalId should not have a status
     */
    public function proposalShouldHaveNoStatus(int $proposalId)
    {
        $proposal = $this->getRepository('CapcoAppBundle:Proposal')->find($proposalId);
        expect($proposal->getStatus())->toBe(null);
        $this->getEntityManager()->clear();
    }

    /**
     * @Then proposal :proposalId should be selected in selection step :stepId
     */
    public function proposalShouldBeSelected(int $proposalId, string $selectionStepId)
    {
        $this->getEntityManager()->clear();
        $selection = $this->getRepository('CapcoAppBundle:Selection')->findOneBy([
          'selectionStep' => $selectionStepId,
          'proposal' => $proposalId,
        ]);
        expect($selection)->toNotBe(null);
    }

    /**
     * @Then proposal :proposalId should not be selected in selection step :stepId
     */
    public function proposalShouldNotBeSelected(int $proposalId, string $selectionStepId)
    {
        $this->getEntityManager()->clear();
        $selection = $this->getRepository('CapcoAppBundle:Selection')->findOneBy([
          'selectionStep' => $selectionStepId,
          'proposal' => $proposalId,
        ]);
        expect($selection)->toBe(null);
    }

    /**
     * @When I add a proposal vote comment
     */
    public function iAddAProposalVoteComment()
    {
        $this->fillField('proposal-vote__comment', 'Coucou !');
    }

    /**
     * @When I check the proposal vote private checkbox
     */
    public function iCheckTheProposalVotePrivateCheckbox()
    {
        $this->checkOption('proposal-vote__private');
    }

    /**
     * @When I submit the proposal vote form
     */
    public function iSubmitTheProposalVoteForm()
    {
        $page = $this->getCurrentPage()->submitProposalVoteForm();
        $this->iWait(8); // We wait for alert to disappear
    }

    /**
     * @Given :userSlug has voted for proposal :proposalId in selection step :stepSlug
     */
    public function userHasVotedForProposalForStep(string $userSlug, int $proposalId, string $stepSlug)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->findOneBySlug($userSlug);
        $proposal = $this->getRepository('CapcoAppBundle:Proposal')->find($proposalId);
        $step = $this->getRepository('CapcoAppBundle:Steps\SelectionStep')->findOneBySlug($stepSlug);
        \PHPUnit_Framework_Assert::assertNotNull(
          $this->getRepository('CapcoAppBundle:ProposalSelectionVote')
               ->findOneBy(['user' => $user, 'proposal' => $proposal, 'selectionStep' => $step])
        );
    }

    /**
     * @Then the proposal vote button must be disabled
     * @Then the proposal :id vote button must be disabled
     */
    public function theProposalVoteButtonMustBeDisabled(int $id = null)
    {
        $id = $id ?: $this->getProposalId();
        $button = $this->getCurrentPage()->getVoteButton($id);
        \PHPUnit_Framework_Assert::assertTrue(
            $button->hasClass('disabled') || $button->hasAttribute('disabled'),
            'The proposal vote button is not disabled neither it has class "disabled".'
        );
    }

    /**
     * @Then the proposal vote button with id :id must not be present
     * @Then the proposal vote button must not be present
     */
    public function theProposalVoteButtonWithIdMustNotBePresent(int $id = 0)
    {
        $execpetionMessage = $id > 0
            ? '"proposal vote button ' . $id . '" element is not present on the page'
            : '"proposal vote button" element is not present on the page';

        try {
            $button = $this->getCurrentPage()->getVoteButton($this->getProposalId());
        } catch (\Exception $e) {
            \PHPUnit_Framework_Assert::assertSame($execpetionMessage, $e->getMessage());
        }
    }

    /**
     * @When I should see the proposal vote limited tooltip
     */
    public function iShouldSeeTheProposalVoteLimitedTooltip()
    {
        $this->assertPageContainsText('Limite de votes atteinte');
    }

    /**
     * @When I should see the proposal vote tooltip
     */
    public function iShouldSeeTheProposalVoteTooltip()
    {
        $button = $this->navigationContext->getPage('selection page')->getVoteButton($this->getProposalId());
        // useless click to scroll the page
        $this->getSession()->getDriver()->click($button->getParent()->getParent()->getParent()->getParent()->getXpath());
        try {
            $this->getSession()->getDriver()->click($button->getParent()->getXpath());
        } catch (\Exception $e) {
        }
        $this->iWait(1);
        $this->assertPageContainsText('Vous avez atteint la limite du budget.');
    }

    /**
     * @Then I should see my comment in the proposal comments list
     */
    public function iShouldSeeMyCommentInTheProposalCommentsList()
    {
        $this->assertProposalCommentsContains('Coucou !');
    }

    /**
     * @Then I should see my vote in the proposal votes list
     */
    public function iShouldSeeMyVoteInTheProposalVotesList()
    {
        $this->assertFirstProposalVoteContains('user');
    }

    /**
     * @Then I should not see my vote in the proposal votes list
     */
    public function iShouldNotSeeMyVoteInTheProposalVotesList()
    {
        $this->assertFirstProposalVoteNotContains('user');
    }

    /**
     * @Then I should see my anonymous vote in the proposal votes list
     */
    public function iShouldSeeMyAnonymousVoteInTheProposalVotesList()
    {
        $this->assertFirstProposalVoteContains('Anonyme');
    }

    /**
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
        $this->iWait(3); // Wait alert to disappear
        $this->getSession()->wait(3000, "$('" . $page->getSelector('votes tab') . "').length > 0");
        $page->clickVotesTab();
        $this->iWait(1);
    }

    /**
     * @When I go to the proposal comments tab
     */
    public function iGoToTheProposalCommentsTab()
    {
        $page = $this->getCurrentPage();
        $this->iWait(3); // Wait alert to disappear
        $this->getSession()->wait(3000, "$('" . $page->getSelector('comments tab') . "').length > 0");
        $page->clickCommentsTab();
        $this->iWait(1);
    }

    /**
     * @Then I should have :filesNumber files in media folder
     */
    public function iShouldHaveXFilesInMediaFolder(int $filesNumber)
    {
        $filesCount = iterator_count(
            new FilesystemIterator('/var/www/web/media/default/0001/01', FilesystemIterator::SKIP_DOTS)
        );
        \PHPUnit_Framework_Assert::assertSame($filesNumber, $filesCount);
    }

    /**
     * @When I save current proposals
     */
    public function iSaveCurrentProposals()
    {
        $items = array_map(
            function ($element) {
                return $element->getText();
            },
            $this->getSession()->getPage()->findAll('css', '.opinion__list .proposal__title')
        );

        $this->currentCollectsStep = $items;
    }

    /**
     * @When I should see same proposals
     */
    public function iShouldSeeSameProposals()
    {
        $savedSteps = $this->currentCollectsStep;
        $selector = '.opinion__list .proposal__title';

        $items = array_map(
            function ($element) {
                return $element->getText();
            },
            $this->getSession()->getPage()->findAll('css', $selector)
        );

        \PHPUnit_Framework_Assert::assertSame($savedSteps, $items);
    }

    /**
     * @When I should see other proposals
     */
    public function iShouldSeeOtherProposals()
    {
        $savedSteps = $this->currentCollectsStep;
        $selector = '.opinion__list .proposal__title span span';

        $items = array_map(
            function ($element) {
                return $element->getText();
            },
            $this->getSession()->getPage()->findAll('css', $selector)
        );

        \PHPUnit_Framework_Assert::assertNotSame($savedSteps, $items);
    }

    /**
     * @When I should not see random row
     */
    public function isShouldNotSeeRandomRow()
    {
        $this->assertPageNotContainsText('Relancer le tri aléatoire');
    }

    /**
     * @Then I should have :filesNumber files in source media folder
     */
    public function iShouldHaveXFilesInSourceMediaFolder(int $filesNumber)
    {
        if (!is_dir('/var/www/web/media/sources/0001/01')) {
            \PHPUnit_Framework_Assert::assertSame($filesNumber, 0);

            return;
        }

        $filesCount = iterator_count(
            new FilesystemIterator('/var/www/web/media/sources/0001/01', FilesystemIterator::SKIP_DOTS)
        );
        \PHPUnit_Framework_Assert::assertSame($filesNumber, $filesCount);
    }

    protected function openCollectStepIsOpen()
    {
        return $this->navigationContext
            ->getPage('collect page')
            ->isOpen(self::$collectStepOpenParams)
            ;
    }

    protected function closedCollectStepIsOpen()
    {
        return $this->navigationContext
            ->getPage('collect page')
            ->isOpen(self::$collectStepClosedParams)
            ;
    }

    protected function proposalPageIsOpen()
    {
        return $this->navigationContext->getPage('proposal page')->isOpen(self::$proposalWithSimpleVoteParams);
    }

    protected function proposalNotYetVotablePageIsOpen()
    {
        return $this->navigationContext->getPage('proposal page')->isOpen(self::$proposalNotYetVotable);
    }

    protected function proposalNotVotableAnymoreIsOpen()
    {
        return $this->navigationContext->getPage('proposal page')->isOpen(self::$proposalNotVotableAnymore);
    }

    protected function proposalBeforeProposal($proposal1, $proposal2)
    {
        $this->element1ShouldBeBeforeElement2ForSelector(
            $proposal1,
            $proposal2,
            '.proposal__preview .proposal__title'
        );
    }

    protected function fillProposalForm($fillDistrict = false, $fillTheme = false, $requiredResponse = 'Réponse à la question 2')
    {
        $tableNode = new TableNode([
            ['proposal_title', 'Nouvelle proposition créée'],
            ['proposal_body', 'Description de ma proposition'],
            ['proposal_custom-1', 'Réponse à la question 1'],
            ['proposal_address', '5 Allée Rallier-du-Baty 35000 Rennes'],
        ]);
        if ($requiredResponse !== false) {
            $this->fillField('proposal_custom-3', $requiredResponse);
        }
        $this->fillFields($tableNode);
        $this->selectOption('proposal_category', 'Politique');
        if ($fillTheme) {
            $this->selectOption('proposal_theme', 'Justice');
        }
        if ($fillDistrict) {
            $this->selectOption('proposal_district', 'Beauregard');
        }
        $this->iWait(1);
        $this->iClickElement('#PlacesAutocomplete__autocomplete-container > div:first-child');
        $this->iWait(1);
    }

    protected function votesDetailsPageIsOpen()
    {
        return $this->navigationContext->getPage('project user votes page')->isOpen();
    }

    protected function selectionStepWithSimpleVoteIsOpen()
    {
        return $this->navigationContext
            ->getPage('selection page')
            ->isOpen(self::$selectionStepWithSimpleVoteParams)
            ;
    }

    protected function selectionStepWithBudgetVoteIsOpen()
    {
        return $this->navigationContext
            ->getPage('selection page')
            ->isOpen(self::$selectionStepWithBudgetVoteParams)
            ;
    }

    protected function selectionStepNotYetOpenIsOpen()
    {
        return $this->navigationContext
            ->getPage('selection page')
            ->isOpen(self::$selectionStepNotYetOpen)
            ;
    }

    protected function selectionStepClosedIsOpen()
    {
        return $this->navigationContext
            ->getPage('selection page')
            ->isOpen(self::$selectionStepClosed)
            ;
    }

    protected function proposalPageWithBudgetVoteIsOpen()
    {
        return $this->navigationContext->getPage('proposal page')->isOpen(self::$proposalWithBudgetVoteParams);
    }

    protected function getProposalId(): int
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

        throw new \Exception('Unknown proposalId');
    }

    protected function clickProposalVoteButtonWithLabel(string $label, int $id = null)
    {
        $page = $this->getCurrentPage();
        $proposalId = $id ?: $this->getProposalId();
        $buttonLabel = $page->getVoteButtonLabel($proposalId);
        \PHPUnit_Framework_Assert::assertEquals($label, $buttonLabel, 'Incorrect button label ' . $buttonLabel . ' on proposal vote button.');
        $page->clickVoteButton($proposalId);
        $this->iWait(2);
    }

    protected function assertProposalCommentsContains($text)
    {
        $firstVoteSelector = $this->navigationContext->getPage('proposal page')->getCommentsListSelector();
        $this->assertElementContainsText($firstVoteSelector, $text);
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
}
