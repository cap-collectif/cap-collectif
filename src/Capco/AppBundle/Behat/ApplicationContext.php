<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\TableNode;
use Behat\Mink\Exception\ElementNotFoundException;
use Behat\Testwork\Hook\Scope\AfterSuiteScope;
use Behat\Testwork\Tester\Result\TestResult;
use Capco\AppBundle\Toggle\Manager;
use Joli\JoliNotif\Notification;
use Joli\JoliNotif\NotifierFactory;
use WebDriver\Exception\ElementNotVisible;
use Docker\Docker;
use Docker\Http\Client;
use Docker\Container;
use Docker\Exception\UnexpectedStatusCodeException;
use Symfony\Component\Process\Process;

class ApplicationContext extends UserContext
{
    protected $headers;
    protected $dbContainer;

    protected static $collectStepOpenParams = [
        'projectSlug' => 'budget-participatif-rennes',
        'stepSlug' => 'collecte-des-propositions',
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
    protected static $proposalWithSimpleVoteParams = [
        'projectSlug' => 'projet-avec-budget',
        'stepSlug' => 'collecte-des-propositions',
        'proposalSlug' => 'renovation-du-gymnase',
    ];
    protected static $proposalWithBudgetVoteParams = [
        'projectSlug' => 'projet-avec-budget',
        'stepSlug' => 'collecte-des-propositions-1',
        'proposalSlug' => 'proposition-pas-chere',
    ];
    protected static $opinionWithVersions = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-1',
    ];
    protected static $version = [
        'projectSlug' => 'projet-de-loi-renseignement',
        'stepSlug' => 'elaboration-de-la-loi',
        'opinionTypeSlug' => 'section-1-ouverture-des-donnees-publiques',
        'opinionSlug' => 'article-1',
        'versionSlug' => 'modification-1',
    ];

    /**
     * @BeforeScenario
     */
    public function reset($scope)
    {
        // Let's stick with the old way for now
        $jobs = [
            new Process('curl -sS -XDELETE \'http://elasticsearch:9200/_all\''),
            new Process('curl -sS -XBAN http://capco.test/'),
            new Process('mysql -h database -u root symfony < var/db.backup'),
            new Process('redis-cli -h redis FLUSHALL'),
        ];

        $scenario = $scope->getScenario();
        if ($scenario->hasTag('elasticsearch')) {
            $jobs[] = new Process('php bin/console fos:elastica:populate -n');
        }
        foreach ($jobs as $job) {
            $job->mustRun();
        }
    }

    public function resetUsingDocker()
    {
        // This is the real docker way, but not that easy
        // We need to use something like https://github.com/jwilder/nginx-proxy
        // To reload containers, because we can't do reload on runtime with links
        // So we have to make sure it's supported on Circle-CI...
        $docker = new Docker(new Client('unix:///run/docker.sock'));
        $manager = $docker->getContainerManager();

        if (null !== $this->dbContainer && $this->dbContainer->exists()) {
            try {
                $manager->stop($this->dbContainer)->remove($this->dbContainer, true, true);
            } catch (UnexpectedStatusCodeException $e) {
                if (!strpos($e->getMessage(), 'Driver btrfs failed to remove root filesystem')) {
                    throw $e;
                }
                // We don't care about this error that happen only because of Circle-CI bad support of Docker
            }
        }

        $this->dbContainer = new Container(['Image' => 'capco/fixtures']);
        $manager->create($this->dbContainer)->start($this->dbContainer);
    }

    /**
     * @AfterScenario @javascript
     */
    public function clearLocalStorage()
    {
        $this->getSession()->getDriver()->evaluateScript('localStorage.clear();');
    }

    /**
     * @AfterSuite
     *
     * @param $suiteScope
     */
    public static function notifiyEnd(AfterSuiteScope $suiteScope)
    {
        $suiteName = $suiteScope->getSuite()->getName();
        $resultCode = $suiteScope->getTestResult()->getResultCode();
        if ($notifier = NotifierFactory::create()) {
            $notification = new Notification();
            if ($resultCode === TestResult::PASSED) {
                $notification
                    ->setTitle('Behat suite ended successfully')
                    ->setBody('Suite "'.$suiteName.'" has ended without errors (for once). Congrats !')
                ;
            } elseif ($resultCode === TestResult::SKIPPED) {
                $notification
                    ->setTitle('Behat suite ended with skipped steps')
                    ->setBody('Suite "'.$suiteName.'" has ended successfully but some steps have been skipped.')
                ;
            } else {
                $notification
                    ->setTitle('Behat suite ended with errors')
                    ->setBody('Suite "'.$suiteName.'" has ended with errors. Go check it out you moron !')
                ;
            }
            $notifier->send($notification);
        }
    }

    /**
     * @Given all features are enabled
     */
    public function allFeaturesAreEnabled()
    {
        $this->getService('capco.toggle.manager')->activateAll();
    }

    /**
     * @Given feature :feature is enabled
     */
    public function featureIsEnabled($feature)
    {
        $this->getService('capco.toggle.manager')->activate($feature);
    }

    /**
     * @When I print html
     */
    public function printHtml()
    {
        echo $this->getSession()->getPage()->getHtml();
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
     * @Then I should see :element on :page
     */
    public function iShouldSeeElementOnPage($element, $page)
    {
        expect($this->navigationContext->getPage($page)->containsElement($element));
    }

    /**
     * @Then I should not see :element on :page
     */
    public function iShouldNotSeeElementOnPage($element, $page)
    {
        expect(!$this->navigationContext->getPage($page)->containsElement($element));
    }

    /**
     * @Then I should see :nb :element on current page
     */
    public function iShouldSeeNbElementOnPage($nb, $element)
    {
        expect($nb == count($this->getSession()->getPage()->find('css', $element)));
    }

    /**
     * @Then :first should be before :second for selector :cssQuery
     */
    public function element1ShouldBeBeforeElement2ForSelector($first, $second, $cssQuery)
    {
        $items = array_map(
            function ($element) {
                return $element->getText();
            },
            $this->getSession()->getPage()->findAll('css', $cssQuery)
        );
        if (!in_array($first, $items)) {
            throw new ElementNotFoundException($this->getSession(), 'Element "'.$first.'"');
        }
        if (!in_array($second, $items)) {
            throw new ElementNotFoundException($this->getSession(), 'Element "'.$second.'"');
        }
        \PHPUnit_Framework_TestCase::assertTrue(array_search($first, $items) < array_search($second, $items));
    }

    /**
     * @When I click the :element element
     */
    public function iClickElement($selector)
    {
        $element = $this->getSession()->getPage()->find('css', $selector);
        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }
        $element->click();
    }

    /**
     * @When I hover over the :selector element
     */
    public function iHoverOverTheElement($selector)
    {
        $element = $this->getSession()->getPage()->find('css', $selector);

        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }

        $element->mouseOver();
    }

    /**
     * Fills in form field with specified id|name|label|value.
     * Overrided to fill wysiwyg fields as well.
     */
    public function fillField($field, $value)
    {
        $field = $this->fixStepArgument($field);
        $value = $this->fixStepArgument($value);
        try {
            $this->getSession()->getPage()->fillField($field, $value);
        } catch (ElementNotFoundException $e) {
            // Try to get corresponding wysiwyg field
            // Works only with quill editor for now
            $wrapper = $this->getSession()->getPage()->find('named', array('id_or_name', $field));
            if (!$wrapper || !$wrapper->hasClass('editor') || !$wrapper->has('css', '.ql-editor')) {
                throw $e;
            }
            $field = $wrapper->find('css', '.ql-editor');
            $field->setValue($value);
        } catch (ElementNotVisible $e) {
            // Ckeditor case
            $wrapper = $this->getSession()->getPage()->find('named', array('id_or_name', 'cke_'.$field));
            if (!$wrapper || !$wrapper->hasClass('cke')) {
                throw $e;
            }
            $this->getSession()->getDriver()->executeScript('
                CKEDITOR.instances["'.$field.'"].setData("'.$value.'");
            ');
        }
    }

    /**
     * @When I wait :seconds seconds
     */
    public function iWait($seconds)
    {
        $this->getSession()->wait(intval($seconds * 1000));
    }

    /**
     * @When I try to download :path
     */
    public function iTryToDownload($path)
    {
        $url = $this->getSession()->getCurrentUrl().$path;
        $this->headers = get_headers($url);
        $this->getSession()->visit($url);
    }

    /**
     * @Then /^I should see response status code "([^"]*)"$/
     */
    public function iShouldSeeResponseStatusCode($statusCode)
    {
        $responseStatusCode = $this->getSession()->getStatusCode();
        if (!$responseStatusCode == intval($statusCode)) {
            throw new \Exception(sprintf('Did not see response status code %s, but %s.', $statusCode, $responseStatusCode));
        }
    }

    /**
     * @Then /^I should see in the header "([^"]*)"$/
     */
    public function iShouldSeeInTheHeader($header)
    {
        assert(in_array($header, $this->headers), "Did not see \"$header\" in the headers.");
    }

    /**
     * Checks if an element has a class
     * Copyright neemzy https://github.com/neemzy/patchwork-core.
     *
     * @Then /^"([^"]*)" element should have class "([^"]*)"$/
     */
    public function elementShouldHaveClass($selector, $class)
    {
        $session = $this->getSession();
        $page = $session->getPage();
        $element = $page->find('css', $selector);
        if (!$element) {
            throw new ElementNotFoundException($session, 'Element "'.$selector.'"');
        }
        \PHPUnit_Framework_TestCase::assertTrue($element->hasClass($class));
    }

    /**
     * Checks if an element doesn't have a class
     * Copyright neemzy https://github.com/neemzy/patchwork-core.
     *
     * @Then /^"([^"]*)" element should not have class "([^"]*)"$/
     */
    public function elementShouldNotHaveClass($selector, $class)
    {
        $session = $this->getSession();
        $page = $session->getPage();
        $element = $page->find('css', $selector);
        if (!$element) {
            throw new ElementNotFoundException($session, 'Element "'.$selector.'"');
        }
        \PHPUnit_Framework_TestCase::assertFalse($element->hasClass($class));
    }

    /**
     * Checks that a button is disabled.
     *
     * @Then /^the button "([^"]*)" should be disabled$/
     */
    public function buttonShouldBeDisabled($locator)
    {
        $locator = $this->fixStepArgument($locator);
        $button = $this->getSession()->getPage()->findButton($locator);

        if (null === $button) {
            throw new ElementNotFoundException($this->getSession(), 'button', 'id|name|title|alt|value', $locator);
        }

        \PHPUnit_Framework_TestCase::assertTrue($button->hasAttribute('disabled'));
    }

    /**
     * Checks that an element has an attribute.
     *
     * @Then /^the element "([^"]*)" should have attribute :attribute $/
     */
    public function elementHasAttribute($selector, $attribute)
    {
        $element = $this->getSession()->getPage()->find('css', $selector);

        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }

        \PHPUnit_Framework_TestCase::assertTrue($element->hasAttribute($attribute));
    }

    private function visitPageWithParams($page, $params)
    {
        $this->navigationContext->getPage($page)->open($params);
        $this->iWait(2);
    }

    // ********************************* Proposals *********************************************

    protected function getCurrentProposalPage()
    {
        if ($this->proposalPageIsOpen() || $this->proposalPageWithBudgetVoteIsOpen()) {
            return $this->navigationContext->getPage('proposal page');
        }
        if ($this->selectionStepWithSimpleVoteIsOpen() || $this->selectionStepWithBudgetVoteIsOpen()) {
            return $this->navigationContext->getPage('selection page');
        }
        if ($this->closedCollectStepIsOpen() || $this->openCollectStepIsOpen()) {
            return $this->navigationContext->getPage('collect page');
        }

        return;
    }

    /**
     * Go to an open collect step page.
     *
     * @When I go to an open collect step
     */
    public function iGoToAnOpenCollectStep()
    {
        $this->visitPageWithParams('collect page', self::$collectStepOpenParams);
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
    }

    protected function proposalPageIsOpen()
    {
        return $this->navigationContext->getPage('proposal page')->isOpen(self::$proposalWithSimpleVoteParams);
    }

    /**
     * There should be nb proposals.
     *
     * @Then there should be :nb proposals
     */
    public function thereShouldBeNbProposals($nb)
    {
        $this->assertPageContainsText($nb.' propositions');
        $proposalSelector = $this->getCurrentProposalPage()->getProposalSelector();
        $this->assertNumElements($nb, $proposalSelector);
    }

    /**
     * I change the theme filter.
     *
     * @When I change the theme filter
     */
    public function iChangeTheThemeFilter()
    {
        $this->selectOption('proposal-filter-theme', 'Justice');
        $this->iWait(1);
    }

    /**
     * I sort proposals by date.
     *
     * @When I sort proposals by date
     */
    public function iSortProposalsByDate()
    {
        $this->getCurrentProposalPage()->sortByDate();
        $this->iWait(1);
    }

    /**
     * I sort proposals by comments.
     *
     * @When I sort proposals by comments
     */
    public function iSortProposalsByComments()
    {
        $this->getCurrentProposalPage()->sortByComments();
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
        $option = $this->getCurrentProposalPage()->getSelectedSortingOption();
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
        $option = $this->getCurrentProposalPage()->getSelectedSortingOption();
        \PHPUnit_Framework_Assert::assertEquals('random', $option);
    }

    /**
     * Proposals should be ordered by comments.
     *
     * @Then proposals should be ordered by comments
     */
    public function proposalsShouldBeOrderedByComments()
    {
        $option = $this->getCurrentProposalPage()->getSelectedSortingOption();
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
        $option = $this->getCurrentProposalPage()->getSelectedSortingOption();
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
            $this->fillField('proposal_custom-2', $requiredResponse);
        }
        $this->fillFields($tableNode);
        $this->selectOption('proposal_district', 'Beaulieu');
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
        $votesCount = $this->getCurrentProposalPage()->getVotesCount($this->getProposalId());
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
        $commentsCount = $this->getCurrentProposalPage()->getCommentsCount($this->getProposalId());
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
        $page = $this->getCurrentProposalPage();
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
        $page = $this->getCurrentProposalPage()->submitProposalVoteForm();
        $this->iWait(3);
    }

    /**
     * The proposal vote button must be disabled.
     *
     * @Then the proposal vote button must be disabled
     */
    public function theProposalVoteButtonMustBeDisabled()
    {
        $button = $this->getCurrentProposalPage()->getVoteButton($this->getProposalId());
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

    // ******************************** Reporting ***************************

    /**
     * I fill the reporting form.
     *
     * @When I fill the reporting form
     */
    public function iFillTheReportingForm()
    {
        $tableNode = new TableNode([
            ['capco_app_reporting_status', '1'],
            ['capco_app_reporting_body', 'Pas terrible tout ça...'],
        ]);
        $this->fillFields($tableNode);
    }

    /**
     * I submit the reporting form.
     *
     * @When I submit the reporting form
     */
    public function iSubmitTheReportingForm()
    {
        $this->pressButton('Signaler');
        $this->iWait(1);
    }
    
    // ************************** Project stats *****************************

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
    * I confirm version deletion
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


}
