<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Gherkin\Node\TableNode;

trait IdeaStepsTrait
{
    protected static $ideaWithPinnedComments = [
        'slug' => 'troisieme-idee',
    ];

    protected static $ideaWithVotes = [
        'slug' => 'derniere-idee',
    ];

    protected static $ideaNotCommentable = [
        'slug' => 'ideanotcommentable',
    ];

    /**
     * Go to an idea with pinned comments.
     *
     * @When I go to an idea with pinned comments
     */
    public function iGoToAnIdeaWithPinnedComments()
    {
        $this->visitPageWithParams('idea page', self::$ideaWithPinnedComments);
    }

    /**
     * Go to an idea with votes.
     *
     * @When I go to an idea with votes
     */
    public function iGoToAnIdeaWithVotes()
    {
        $this->visitPageWithParams('idea page', self::$ideaWithVotes);
    }

    /**
     * Go to an idea not commentable.
     *
     * @When I go to an idea not commentable
     */
    public function iGoToAnIdeaNotCommentable()
    {
        $this->visitPageWithParams('idea page', self::$ideaNotCommentable);
    }

    /**
     * Go to the ideas Page.
     *
     * @When I go to the ideas page
     */
    public function iGoToTheIdeasPage()
    {
        $this->visitPageWithParams('ideas page');
    }

    /**
     * There should be nb ideas.
     *
     * @Then there should be :nb ideas
     *
     * @param mixed $nb
     */
    public function thereShouldBeNbIdeas($nb)
    {
        $ideaSelector = $this->getCurrentPage()->getIdeaSelector();
        $this->assertNumElements($nb, $ideaSelector);
    }

    /**
     * I change the ideas theme filter.
     *
     * @When I change the ideas theme filter
     */
    public function iChangeTheIdeasThemeFilter()
    {
        $this->selectOption('idea-filter-theme', 'Justice');
        $this->iWait(1);
    }

    /**
     * Ideas should be ordered by date.
     *
     * @Then ideas should be ordered by date
     */
    public function ideasShouldBeOrderedByDate()
    {
        $option = $this->getCurrentPage()->getSelectedSortingOption();
        \PHPUnit_Framework_Assert::assertEquals('last', $option);
        $this->ideaBeforeIdea(
            'ideaNotCommentable',
            'ideaCommentable'
        );
    }

    /**
     * Ideas should be ordered by comments.
     *
     * @Then ideas should be ordered by comments
     */
    public function ideasShouldBeOrderedByComments()
    {
        $option = $this->getCurrentPage()->getSelectedSortingOption();
        \PHPUnit_Framework_Assert::assertEquals('comments', $option);
        $this->ideaBeforeIdea(
            'ideaCommentable',
            'Idée avec un titre très très long pour voir comment ça rend dans la preview'
        );
    }

    /**
     * I sort ideas by comments.
     *
     * @When I sort ideas by comments
     */
    public function iSortIdeasByComments()
    {
        $this->getCurrentPage()->sortByComments();
        $this->iWait(1);
    }

    /**
     * I search for ideas with terms.
     *
     * @When I search for ideas with terms :terms
     *
     * @param mixed $terms
     */
    public function iSearchForIdeasWithTerms($terms)
    {
        $this->fillField('idea-search-input', $terms);
        $this->pressButton('idea-search-button');
        $this->iWait(1);
    }

    /**
     * @Then ideas should be filtered by terms
     */
    public function ideasShouldBeFilteredByTerms()
    {
        $this->assertPageContainsText('Dernière idée');
        $this->assertPageNotContainsText('Troisième idée');
    }

    /**
     * @Then I should not see the idea create button
     */
    public function iShouldNotSeeTheIdeaCreateButton()
    {
        $selector = $this->getCurrentPage()->getIdeaCreateButtonSelector();
        $this->iShouldSeeNbElementOnPage(0, $selector);
    }

    /**
     * @When I click the idea create button
     */
    public function iClickTheIdeaCreateButton()
    {
        $this->getCurrentPage()->clickIdeaCreateButton();
        $this->iWait(1);
    }

    /**
     * @When I fill the idea create form
     */
    public function iFillTheIdeaCreateForm()
    {
        $this->fillIdeaForm();
    }

    /**
     * @When I fill the idea create form with a theme
     */
    public function iFillTheIdeaCreateFormWithATheme()
    {
        $this->fillIdeaForm(true);
    }

    /**
     * @When I submit the new idea
     */
    public function iSubmitTheNewIdea()
    {
        $this->getCurrentPage()->submitIdeaForm();
        $this->iWait(5);
    }

    /**
     * @Then I should see my new idea
     */
    public function iShouldSeMyNewIdea()
    {
        $this->assertPageContainsText('Nouvelle idée créée');
    }

    /**
     * @When I click the idea edit button
     */
    public function iClickTheIdeaEditButton()
    {
        $this->getCurrentPage()->clickIdeaEditButton();
        $this->iWait(1);
    }

    /**
     * @When I edit my idea
     */
    public function iEditMyIdea()
    {
        $page = $this->getCurrentPage();
        $votesCount = $page->getVotesCount();
        \PHPUnit_Framework_Assert::assertNotEquals(0, $votesCount, 'Idea has no votes from the begining, test will not be conclusive.');
        $this->fillField('idea_title', 'Nouveau titre de mon idée.');
        $page->checkIdeaConfirmCheckbox();
        $this->iWait(1);
    }

    /**
     * @When I submit my edited idea
     */
    public function iSubmitMyEditedIdea()
    {
        $this->getCurrentPage()->submitIdeaEditForm();
        $this->iWait(5);
    }

    /**
     * @When my idea should have been modified
     */
    public function myIdeaShouldHaveBeenModified()
    {
        $this->assertPageContainsText('Nouveau titre de mon idée');
    }

    /**
     * @When I edit my idea without confirming my votes lost
     */
    public function iEditMyIdeaWithoutConfirmingMyVotesLost()
    {
        $votesCount = $this->getCurrentPage()->getVotesCount();
        \PHPUnit_Framework_Assert::assertNotEquals(0, $votesCount, 'Idea has no votes from the begining, test will not be conclusive.');
        $this->fillField('idea_title', 'Nouveau titre de mon idée.');
        $this->iWait(1);
    }

    /**
     * @Then my idea should have lost its votes
     */
    public function myIdeaShouldHaveLostItsVotes()
    {
        $votesCount = $this->getCurrentPage()->getVotesCount();
        \PHPUnit_Framework_Assert::assertEquals(0, $votesCount, 'Incorrect votes number ' . $votesCount . ' for idea after edition.');
    }

    /**
     * @Then I should not see the idea edit button
     */
    public function iShouldNotSeeTheIdeaEditButton()
    {
        $this->iShouldNotSeeElementOnPage('idea edit button', 'idea page');
    }

    /**
     * I should not see the idea delete button.
     *
     * @Then I should not see the idea delete button
     */
    public function iShouldNotSeeTheIdeaDeleteButton()
    {
        $this->iShouldNotSeeElementOnPage('idea delete button', 'idea page');
    }

    /**
     * I should not see the idea report button.
     *
     * @Then I should not see the idea report button
     */
    public function iShouldNotSeeTheIdeaReportButton()
    {
        $this->iShouldNotSeeElementOnPage('idea report button', 'idea page');
    }

    /**
     * I click the idea report button.
     *
     * @When I click the idea report button
     */
    public function iClickTheIdeaReportButton()
    {
        $this->getCurrentPage()->clickIdeaReportButton();
        $this->iWait(1);
    }

    /**
     * I delete my idea.
     *
     * @When I delete my idea
     */
    public function iDeleteMyIdea()
    {
        $page = $this->getCurrentPage();
        $page->clickIdeaDeleteButton();
        $this->iWait(1);
        $page->clickIdeaConfirmDeletionButton();
        $this->iWait(5);
        $this->currentPage = 'ideas page';
    }

    /**
     * I should not see my idea anymore.
     *
     * @Then I should not see my idea anymore
     */
    public function iShouldNotSeeMyIdeaAnymore()
    {
        $this->assertPageNotContainsText('Dernière idée');
    }

    /**
     * I click the idea vote button.
     *
     * @When I click the idea vote button
     */
    public function iClickTheIdeaVoteButton()
    {
        $this->clickIdeaVoteButtonWithLabel('proposal.vote.add');
    }

    /**
     * I click the idea unvote button.
     *
     * @When I click the idea unvote button
     */
    public function iClickTheIdeaUnvoteButton()
    {
        $this->clickIdeaVoteButtonWithLabel('vote.cancel');
    }

    /**
     * I fill the idea vote form.
     *
     * @When I fill the idea vote form
     */
    public function iFillTheIdeaVoteForm()
    {
        $tableNode = new TableNode([
            ['idea-vote-username', 'test'],
            ['idea-vote-email', 'test@coucou.fr'],
        ]);
        $this->fillFields($tableNode);
    }

    /**
     * I fill the idea vote form with already used email.
     *
     * @When I fill the idea vote form with already used email
     */
    public function iFillTheIdeaVoteFormWithAlreadyUsedEmail()
    {
        $tableNode = new TableNode([
            ['idea-vote-username', 'test'],
            ['idea-vote-email', 'cheater@test.com'],
        ]);
        $this->fillFields($tableNode);
    }

    /**
     * I fill the idea vote form with a registered email.
     *
     * @When I fill the idea vote form with a registered email
     */
    public function iFillTheIdeaVoteFormWithARegisteredEmail()
    {
        $tableNode = new TableNode([
            ['idea-vote-username', 'test'],
            ['idea-vote-email', 'user@test.com'],
        ]);
        $this->fillFields($tableNode);
    }

    /**
     * I add an idea vote comment.
     *
     * @When I add an idea vote comment
     */
    public function iAddAnIdeaVoteComment()
    {
        $this->fillField('idea-vote-comment', 'Coucou !');
    }

    /**
     * I check the idea vote private checkbox.
     *
     * @When I check the idea vote private checkbox
     */
    public function iCheckTheIdeaVotePrivateCheckbox()
    {
        $this->checkOption('idea-vote-private');
    }

    /**
     * @When I submit the idea vote form
     */
    public function iSubmitTheIdeaVoteForm()
    {
        $page = $this->getCurrentPage()->clickVoteButton();
        $this->iWait(3);
    }

    /**
     * The idea vote button must be disabled.
     *
     * @Then the idea vote button must be disabled
     */
    public function theIdeaVoteButtonMustBeDisabled()
    {
        $button = $this->getCurrentPage()->getVoteButton();
        \PHPUnit_Framework_Assert::assertTrue(
            $button->hasClass('disabled') || $button->hasAttribute('disabled'),
            'The idea vote button is not disabled neither it has class "disabled".'
        );
    }

    /**
     * I should see my comment in the idea comments list.
     *
     * @Then I should see my comment in the idea comments list
     */
    public function iShouldSeeMyCommentInTheIdeaCommentsList()
    {
        $this->assertIdeaCommentsContains('Coucou !');
    }

    /**
     * I should see my vote in the idea votes list.
     *
     * @Then I should see my vote in the idea votes list
     */
    public function iShouldSeeMyVoteInTheIdeaVotesList()
    {
        $this->assertFirstIdeaVoteContains('user');
    }

    /**
     * I should not see my vote in the idea votes list.
     *
     * @Then I should not see my vote in the idea votes list
     */
    public function iShouldNotSeeMyVoteInTheIdeaVotesList()
    {
        $this->assertFirstIdeaVoteNotContains('user');
    }

    /**
     * @Then I should see my anonymous vote in the idea votes list
     */
    public function iShouldSeeMyAnonymousVoteInTheIdeaVotesList()
    {
        $this->assertFirstIdeaVoteContains('global.anonymous');
    }

    /**
     * @Then I should see my not logged in vote in the idea votes list
     */
    public function iShouldSeeMyNotLoggedInVoteInTheIdeaVotesList()
    {
        $this->assertFirstIdeaVoteContains('test');
    }

    /**
     * I click the share idea button.
     *
     * @When I click the share idea button
     */
    public function iClickTheShareIdeaButton()
    {
        $this->getCurrentPage()->clickShareButton();
        $this->iWait(1);
    }

    /**
     * The idea should have nb votes.
     *
     * @Given the idea has :nb votes
     * @Then the idea should have :nb votes
     *
     * @param mixed $nb
     */
    public function theIdeaShouldHaveNbVotes($nb)
    {
        $votesCount = $this->getCurrentPage()->getVotesCount();
        \PHPUnit_Framework_Assert::assertEquals($nb, $votesCount, 'Incorrect votes number ' . $votesCount . ' for idea.');
    }

    /**
     * @Given the idea has :nb comments
     * @Then the idea should have :nb comments
     */
    public function theIdeaShouldHaveNbComments(int $nb)
    {
        $commentsCount = $this->getCurrentPage()->getCommentsCount();
        \PHPUnit_Framework_Assert::assertEquals($nb, $commentsCount, 'Incorrect comments number ' . $commentsCount . ' for idea.');
    }

    /**
     * The theme should be selected in the idea form.
     *
     * @Then the theme should be selected in the idea form
     */
    public function theThemeShouldBeSelectedInTheIdeaForm()
    {
        $this->optionIsSelectedInSelect('Thème vide', 'idea_theme');
    }

    /**
     * I click the ideas trash link.
     *
     * @When I click the ideas trash link
     */
    public function iClickTheIdeasTrashLink()
    {
        $this->getCurrentPage()->clickIdeasTrashLink();
        $this->iWait(2);
    }

    protected function ideaBeforeIdea($idea1, $idea2)
    {
        $this->element1ShouldBeBeforeElement2ForSelector(
            $idea1,
            $idea2,
            '.idea__preview .idea__title a'
        );
    }

    protected function fillIdeaForm($theme = false)
    {
        $tableNode = new TableNode([
            ['idea_title', 'Nouvelle idée créée'],
            ['idea_body', 'Description de mon idée'],
            ['idea_object', 'Objectif de mon idée'],
            ['idea_url', 'http://www.google.fr'],
        ]);
        $this->fillFields($tableNode);
        if ($theme) {
            $this->selectOption('idea_theme', 'Immobilier');
        }
    }

    protected function clickIdeaVoteButtonWithLabel(string $label)
    {
        $page = $this->getCurrentPage();
        $buttonLabel = $page->getVoteButtonLabel();
        \PHPUnit_Framework_Assert::assertEquals($label, $buttonLabel, 'Incorrect button label ' . $buttonLabel . ' on idea vote button.');
        $page->clickVoteButton();
        $this->iWait(2);
    }

    protected function assertIdeaCommentsContains(string $text)
    {
        $commentsListSelector = $this->getCurrentPage()->getCommentsListSelector();
        $this->assertElementContainsText($commentsListSelector, $text);
    }

    protected function assertFirstIdeaVoteContains(string $text)
    {
        $firstVoteSelector = $this->getCurrentPage()->getFirstVoteSelector();
        $this->assertElementContainsText($firstVoteSelector, $text);
    }

    protected function assertFirstIdeaVoteNotContains(string $text)
    {
        $firstVoteSelector = $this->getCurrentPage()->getFirstVoteSelector();
        $this->assertElementNotContainsText($firstVoteSelector, $text);
    }
}
