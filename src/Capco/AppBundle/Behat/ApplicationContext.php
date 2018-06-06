<?php

namespace Capco\AppBundle\Behat;

use Behat\Behat\Hook\Scope\AfterScenarioScope;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Behat\Gherkin\Node\TableNode;
use Behat\Mink\Exception\ElementNotFoundException;
use Behat\Mink\Exception\ExpectationException;
use Behat\Testwork\Hook\Scope\AfterSuiteScope;
use Behat\Testwork\Tester\Result\TestResult;
use Capco\AppBundle\Behat\Page\HomePage;
use Capco\AppBundle\Behat\Traits\AdminTrait;
use Capco\AppBundle\Behat\Traits\CommentStepsTrait;
use Capco\AppBundle\Behat\Traits\NotificationsStepTrait;
use Capco\AppBundle\Behat\Traits\OpinionStepsTrait;
use Capco\AppBundle\Behat\Traits\ProjectStepsTrait;
use Capco\AppBundle\Behat\Traits\ProposalEvaluationTrait;
use Capco\AppBundle\Behat\Traits\ProposalStepsTrait;
use Capco\AppBundle\Behat\Traits\QuestionnaireStepsTrait;
use Capco\AppBundle\Behat\Traits\ReportingStepsTrait;
use Capco\AppBundle\Behat\Traits\SharingStepsTrait;
use Capco\AppBundle\Behat\Traits\SynthesisStepsTrait;
use Capco\AppBundle\Behat\Traits\ThemeStepsTrait;
use Elastica\Snapshot;
use Joli\JoliNotif\Notification;
use Joli\JoliNotif\NotifierFactory;
use Symfony\Component\Process\Process;
use WebDriver\Exception\ElementNotVisible;

const REPOSITORY_NAME = 'repository_qa';
const SNAPSHOT_NAME = 'snap_qa';

class ApplicationContext extends UserContext
{
    use CommentStepsTrait;
    use NotificationsStepTrait;
    use OpinionStepsTrait;
    use ProjectStepsTrait;
    use ProposalStepsTrait;
    use ProposalEvaluationTrait;
    use QuestionnaireStepsTrait;
    use ReportingStepsTrait;
    use SharingStepsTrait;
    use SynthesisStepsTrait;
    use ThemeStepsTrait;
    use AdminTrait;
    protected $dbContainer;
    protected $cookieConsented;
    protected $currentPage = 'home page';
    protected $queues = [];

    /**
     * @BeforeScenario
     */
    public function resetScenario(BeforeScenarioScope $scope)
    {
        // We reset everything
        $jobs = [
            new Process('curl -sS -XBAN http://capco.test/'),
            new Process('redis-cli -h redis FLUSHALL'),
        ];

        $scenario = $scope->getScenario();

        // This tag make sure queues are empty at the begining of a test
        if ($scenario->hasTag('rabbitmq')) {
            $messagesTypes = $this->getParameter('swarrot.messages_types');
            foreach ($messagesTypes as $messageType) {
                $this->queues[] = $messageType['routing_key'];
            }
            $jobs[] = new Process('php bin/rabbit vhost:mapping:create --password=' . $this->getParameter('rabbitmq_password') . ' --erase-vhost app/config/rabbitmq.yml');
            $this->purgeRabbitMqQueues();
        }

        // This tag is useful when you analyze the medias folder (e.g: counting number of files)
        // Indeed, we have no way to only copy paste medias because of SonataMediaBundle's workflow.
        // It launch a complete reinit. Use it carefully !
        if ($scenario->hasTag('media')) {
            $jobs[] = new Process('rm -rf web/media/*');
            $jobs[] = new Process('php -d memory_limit=-1 bin/console capco:reinit --force --env=test');
        }
        foreach ($jobs as $job) {
            echo $job->getCommandLine() . PHP_EOL;
            $job->mustRun();
        }

        $this->snapshot = new Snapshot($this->getService('capco.elasticsearch.client'));
        $this->snapshot->registerRepository(REPOSITORY_NAME, 'fs', ['location' => 'var']);

        $this->indexManager = $this->getService('capco.elasticsearch.index_builder');

        try {
            $this->snapshot->deleteSnapshot(REPOSITORY_NAME, SNAPSHOT_NAME);
        } catch (\Elastica\Exception\ResponseException $e) {
            echo 'No ElasticSearch snapshot detected.' . PHP_EOL;
        }
        echo 'Writing ElasticSearch snapshot.' . PHP_EOL;
        $this->snapshot->createSnapshot(REPOSITORY_NAME, SNAPSHOT_NAME, [
          'indices' => $this->indexManager->getLiveSearchIndexName(),
        ], true);
        $this->cookieConsented = false;
    }

    /**
     * @AfterScenario
     */
    public function resetRabbitMq()
    {
        $this->purgeRabbitMqQueues();
    }

    /**
     * @AfterScenario
     */
    public function resetExports(AfterScenarioScope $scope)
    {
        if ($scope->getScenario()->hasTag('export')) {
            $job = new Process('rm -rf web/export/*');
            echo $job->getCommandLine() . PHP_EOL;
            echo 'Clearing exports...' . PHP_EOL;
            $job->mustRun();
        }
    }

    /**
     * @AfterScenario
     */
    public function resetDatabase(AfterScenarioScope $scope)
    {
        $scenario = $scope->getScenario();
        if ($scenario->hasTag('database')) {
            $job = new Process('mysql -h database -u root symfony < var/db.backup');
            echo $job->getCommandLine() . PHP_EOL;
            $job->mustRun();
        }

        echo 'Restoring ElasticSearch snapshot.' . PHP_EOL;
        $indexManager = $this->getService('capco.elasticsearch.index_builder');
        $indexManager->getLiveSearchIndex()->close();
        $this->snapshot->restoreSnapshot(REPOSITORY_NAME, SNAPSHOT_NAME, [], true);
        $indexManager->getLiveSearchIndex()->open();
        $indexManager->markAsLive($indexManager->getLiveSearchIndex());
    }

    // public function resetUsingDocker()
    // {
    // This is the real docker way, but not that easy
    // We need to use something like https://github.com/jwilder/nginx-proxy
    // To reload containers, because we can't do reload on runtime with links
    // So we have to make sure it's supported on Circle-CI...
    // $docker = new Docker(new Client('unix:///run/docker.sock'));
    // $manager = $docker->getContainerManager();
    //
    // if (null !== $this->dbContainer && $this->dbContainer->exists()) {
    //     try {
    //         $manager->stop($this->dbContainer)->remove($this->dbContainer, true, true);
    //     } catch (UnexpectedStatusCodeException $e) {
    //         if (!strpos($e->getMessage(), 'Driver btrfs failed to remove root filesystem')) {
    //             throw $e;
    //         }
    //         // We don't care about this error that happen only because of Circle-CI bad support of Docker
    //     }
    // }
    //
    // $this->dbContainer = new Container(['Image' => 'capco/fixtures']);
    // $manager->create($this->dbContainer)->start($this->dbContainer);
    // }

    /**
     * @BeforeScenario @javascript
     */
    public function maximizeWindow()
    {
        $this->getSession()->getDriver()->maximizeWindow();
    }

    /**
     * @Given I visited :pageName
     */
    public function iVisitedPage(string $pageName)
    {
        $this->setCookieConsent();
        $this->navigationContext->iVisitedPage($pageName);
    }

    /**
     * @Then I should see :filename file in :directory directory
     */
    public function iShouldSeeFileInDirectory(string $filename, string $directory)
    {
        // Make sure we are not using virtual file system, because here we want to see real files in path
        $directory = str_replace('vfs://', '', rtrim($directory, '/\\'));
        $filename = str_replace('vfs://', '', $filename);
        \PHPUnit_Framework_Assert::assertFileExists("$directory/$filename");
    }

    /**
     * @When I reload the page, I should see a confirm popup
     */
    public function iConfirmThePopup()
    {
        $this->getSession()->reload();

        // https://stackoverflow.com/questions/39646444/how-to-handle-a-javascript-alert-window-using-php-behat-mink-selenium2-chrome-we
        $session = $this->getSession()->getDriver()->getWebDriverSession();
        // See message with $session->getAlert_text()
        $session->accept_alert();
    }

    /**
     * @Given I should see the shield
     */
    public function iShouldSeeTheShield()
    {
        $this->assertSession()->elementExists('css', '#shield-mode');
    }

    /**
     * @Given I should not see the shield
     */
    public function iShouldNotSeeTheShield()
    {
        $this->assertSession()->elementNotExists('css', '#shield-mode');
    }

    /**
     * @Given I visited :pageName with:
     *
     * @param mixed $pageName
     */
    public function iVisitedPageWith($pageName, TableNode $parameters)
    {
        $this->setCookieConsent();
        $this->navigationContext->iVisitedPageWith($pageName, $parameters);
    }

    /**
     * @AfterScenario @javascript
     */
    public function clearLocalStorage()
    {
        $this->getSession()->getDriver()->evaluateScript('window.sessionStorage.clear();');
        $this->getSession()->getDriver()->evaluateScript('window.localStorage.clear();');
    }

    /**
     * @AfterSuite
     */
    public static function notifyEnd(AfterSuiteScope $suiteScope)
    {
        $suiteName = $suiteScope->getSuite()->getName();
        $resultCode = $suiteScope->getTestResult()->getResultCode();
        if ($notifier = NotifierFactory::create()) {
            $notification = new Notification();
            if (TestResult::PASSED === $resultCode) {
                $notification
                    ->setTitle('Behat suite ended successfully')
                    ->setBody('Suite "' . $suiteName . '" has ended without errors (for once). Congrats !');
            } elseif (TestResult::SKIPPED === $resultCode) {
                $notification
                    ->setTitle('Behat suite ended with skipped steps')
                    ->setBody('Suite "' . $suiteName . '" has ended successfully but some steps have been skipped.');
            } else {
                $notification
                    ->setTitle('Behat suite ended with errors')
                    ->setBody('Suite "' . $suiteName . '" has ended with errors. Go check it out you moron !');
            }
            $notifier->send($notification);
        }
    }

    /**
     * @Then I should be redirected to :url
     */
    public function assertRedirect(string $url)
    {
        $this->getSession()->wait(1000);

        $this->assertPageAddress($url);
    }

    /**
     * @Then I should not be redirected to :url
     *
     * @param mixed $url
     */
    public function assertNotRedirect($url)
    {
        $this->getSession()->wait(1000);

        $this->assertSession()->addressNotEquals($this->locatePath($url));
    }

    /**
     * @Given all features are enabled
     */
    public function allFeaturesAreEnabled()
    {
        $this->getService('capco.toggle.manager')->activateAll();
    }

    /**
     * @Given feature :featureA is enabled
     * @Given features :featureA, :featureB are enabled
     * @Given features :featureA, :featureB, :featureC are enabled
     *
     * @param null|mixed $featureB
     * @param null|mixed $featureC
     */
    public function activateFeatures(string $featureA, $featureB = null, $featureC = null)
    {
        $this->getService('capco.toggle.manager')->activate($featureA);
        if ($featureB) {
            $this->getService('capco.toggle.manager')->activate($featureB);
            if ($featureC) {
                $this->getService('capco.toggle.manager')->activate($featureC);
            }
        }
    }

    /**
     * @Given feature :featureA should be enabled
     */
    public function featureIsEnabled(string $feature)
    {
        $toggleManager = $this->getService('qandidate.toggle.manager');
        $contextFactory = $this->getService('qandidate.toggle.user_context_factory');
        expect($toggleManager->active($feature, $contextFactory->createContext()))->toBe(true);
    }

    /**
     * @Given feature :featureA is disabled
     * @Given feature :featureA should be disabled
     */
    public function featureIsDisabled(string $feature)
    {
        $toggleManager = $this->getService('qandidate.toggle.manager');
        $contextFactory = $this->getService('qandidate.toggle.user_context_factory');
        expect($toggleManager->active($feature, $contextFactory->createContext()))->toBe(false);
    }

    /**
     * @When I print html
     */
    public function printHtml()
    {
        echo $this->getSession()->getPage()->getHtml();
    }

    /**
     * @Then I should see :element on :page
     */
    public function iShouldSeeElementOnPage(string $element, string $page)
    {
        expect($this->navigationContext->getPage($page)->containsElement($element))->toBe(true);
    }

    /**
     * @Then I should not see :element on :page
     */
    public function iShouldNotSeeElementOnPage(string $element, string $page)
    {
        expect($this->navigationContext->getPage($page)->containsElement($element))->toBe(false);
    }

    /**
     * @Then I should see :element on :page disabled
     */
    public function iShouldSeeElementOnPageDisabled(string $element, string $pageSlug)
    {
        $page = $this->navigationContext->getPage($pageSlug);
        $this->getSession()->wait(2000, "$('" . $page->getSelector($element) . "').length > 0");
        expect($page->getElement($element)->hasAttribute('disabled'))->toBe(true);
    }

    /**
     * @Then I should see :nb :element on current page
     */
    public function iShouldSeeNbElementOnPage(int $nb, string $element)
    {
        expect(count($this->getSession()->getPage()->find('css', $element)))->toBe($nb);
    }

    /**
     * @Then :first should be before :second for selector :cssQuery
     *
     * @param mixed $first
     * @param mixed $second
     */
    public function element1ShouldBeBeforeElement2ForSelector($first, $second, string $cssQuery)
    {
        $items = array_map(
            function ($element) {
                return $element->getText();
            },
            $this->getSession()->getPage()->findAll('css', $cssQuery)
        );
        if (!in_array($first, $items, true)) {
            throw new ElementNotFoundException($this->getSession(), 'Element "' . $first . '"');
        }
        if (!in_array($second, $items, true)) {
            throw new ElementNotFoundException($this->getSession(), 'Element "' . $second . '"');
        }
        \PHPUnit_Framework_TestCase::assertTrue(array_search($first, $items, true) < array_search($second, $items, true));
    }

    /**
     * @When I click the :selector element
     */
    public function iClickElement(string $selector)
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
    public function iHoverOverTheElement(string $selector)
    {
        $element = $this->getSession()->getPage()->find('css', $selector);

        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }

        $element->mouseOver();
    }

    /**
     * @When I focus the :selector element
     */
    public function iFocusTheElement(string $selector)
    {
        $element = $this->getSession()->getPage()->find('css', $selector);

        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }

        $element->focus();
    }

    /**
     * @When I fill the element :element with empty value
     **/
    public function ifillElementWithEmptyValue(string $element)
    {
        $element = $this->getSession()->getPage()->find('css', $element);

        $element->setValue('');
    }

    /**
     * @When I fill the element :element with value :value
     **/
    public function ifillElementWithValue(string $element, string $value)
    {
        $element = $this->getSession()->getPage()->find('css', $element);

        $element->setValue($value);
    }

    /**
     * Fills in form field with specified id|name|label|value.
     * Overrided to fill wysiwyg fields as well.
     *
     * @param mixed $value
     */
    public function fillField(string $field, $value)
    {
        $field = $this->fixStepArgument($field);
        $value = $this->fixStepArgument($value);
        try {
            $this->getSession()->getPage()->fillField($field, $value);
        } catch (ElementNotFoundException $e) {
            // Try to get corresponding wysiwyg field
            // Works only with quill editor for now
            $wrapper = $this->getSession()->getPage()->find('named', ['id_or_name', $field]);
            if (!$wrapper || !$wrapper->hasClass('editor') || !$wrapper->has('css', '.ql-editor')) {
                throw $e;
            }
            $field = $wrapper->find('css', '.ql-editor');
            $field->setValue($value);
        } catch (ElementNotVisible $e) {
            // Ckeditor case
            $wrapper = $this->getSession()->getPage()->find('named', ['id_or_name', 'cke_' . $field]);
            if (!$wrapper || !$wrapper->hasClass('cke')) {
                throw $e;
            }
            $this->getSession()->getDriver()->executeScript('
                CKEDITOR.instances["' . $field . '"].setData("' . $value . '");
            ');
        }
    }

    /**
     * @When I wait :seconds seconds
     */
    public function iWait(int $seconds)
    {
        try {
            $this->getSession()->wait((int) ($seconds * 1000));
        } catch (\RuntimeException $exception) {
            sleep($seconds);
        }
    }

    /**
     * @Given /^I wait for debug$/
     */
    public function iWaitForDebug()
    {
        $this->iWait(1000);
    }

    /**
     * @When I try to download :path
     */
    public function iTryToDownload(string $path)
    {
        $url = $this->getSession()->getCurrentUrl() . $path;
        $this->headers = get_headers($url);
        $this->getSession()->visit($url);
    }

    /**
     * @Then /^I should see response status code "([^"]*)"$/
     */
    public function iShouldSeeResponseStatusCode(int $statusCode)
    {
        $responseStatusCode = $this->getSession()->getStatusCode();
        if (!$responseStatusCode === (int) $statusCode) {
            throw new \Exception(sprintf('Did not see response status code %s, but %s.', $statusCode, $responseStatusCode));
        }
    }

    /**
     * @Then /^I should see in the header "([^"]*)"$/
     */
    public function iShouldSeeInTheHeader(string $header)
    {
        assert(in_array($header, $this->headers, true), "Did not see \"$header\" in the headers.");
    }

    /**
     * Checks if an element has a class
     * Copyright neemzy https://github.com/neemzy/patchwork-core.
     *
     * @Then /^"([^"]*)" element should have class "([^"]*)"$/
     */
    public function elementShouldHaveClass(string $selector, string $class)
    {
        $session = $this->getSession();
        $page = $session->getPage();
        $element = $page->find('css', $selector);
        if (!$element) {
            throw new ElementNotFoundException($session, 'Element "' . $selector . '"');
        }
        \PHPUnit_Framework_TestCase::assertTrue($element->hasClass($class));
    }

    /**
     * Checks if an element doesn't have a class
     * Copyright neemzy https://github.com/neemzy/patchwork-core.
     *
     * @Then /^"([^"]*)" element should not have class "([^"]*)"$/
     */
    public function elementShouldNotHaveClass(string $selector, string $class)
    {
        $session = $this->getSession();
        $page = $session->getPage();
        $element = $page->find('css', $selector);
        if (!$element) {
            throw new ElementNotFoundException($session, 'Element "' . $selector . '"');
        }
        \PHPUnit_Framework_TestCase::assertFalse($element->hasClass($class));
    }

    /**
     * @Then /^the button "([^"]*)" should be disabled$/
     */
    public function buttonShouldBeDisabled(string $locator)
    {
        $locator = $this->fixStepArgument($locator);
        $button = $this->getSession()->getPage()->findButton($locator);

        if (null === $button) {
            throw new ElementNotFoundException($this->getSession(), 'button', 'id|name|title|alt|value', $locator);
        }

        \PHPUnit_Framework_TestCase::assertTrue($button->hasAttribute('disabled'));
    }

    /**
     * @Then /^the button "([^"]*)" should not be disabled$/
     */
    public function buttonShouldNotBeDisabled(string $locator)
    {
        $locator = $this->fixStepArgument($locator);
        $button = $this->getSession()->getPage()->findButton($locator);

        if (null === $button) {
            throw new ElementNotFoundException($this->getSession(), 'button', 'id|name|title|alt|value', $locator);
        }

        \PHPUnit_Framework_TestCase::assertFalse($button->hasAttribute('disabled'));
    }

    /**
     * Checks that an element has an attribute.
     *
     * @Then /^The element "([^"]*)" should have attribute :attribute $/
     *
     * @param mixed $selector
     * @param mixed $attribute
     */
    public function theElementHasAttribute($selector, $attribute)
    {
        $element = $this->getSession()->getPage()->find('css', $selector);

        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }

        \PHPUnit_Framework_TestCase::assertTrue($element->hasAttribute($attribute));
    }

    /**
     * Checks that option from select with specified id|name|label|value is selected.
     *
     * @Then /^the "(?P<option>(?:[^"]|\\")*)" option from "(?P<select>(?:[^"]|\\")*)" (?:is|should be) selected/
     * @Then /^the option "(?P<option>(?:[^"]|\\")*)" from "(?P<select>(?:[^"]|\\")*)" (?:is|should be) selected$/
     * @Then /^"(?P<option>(?:[^"]|\\")*)" from "(?P<select>(?:[^"]|\\")*)" (?:is|should be) selected$/
     *
     * @param mixed $option
     * @param mixed $select
     */
    public function optionIsSelectedInSelect($option, $select)
    {
        $selectField = $this->getSession()->getPage()->findField($select);
        if (null === $selectField) {
            throw new ElementNotFoundException($this->getSession(), 'select field', 'id|name|label|value', $select);
        }

        $optionField = $selectField->find('named', [
            'option',
            $option,
        ]);

        if (null === $optionField) {
            throw new ElementNotFoundException($this->getSession(), 'select option field', 'id|name|label|value', $option);
        }

        if (!$optionField->isSelected()) {
            throw new ExpectationException('Select option field with value|text "' . $option . '" is not selected in the select "' . $select . '"', $this->getSession());
        }
    }

    /**
     * @override Given /^(?:|I )am on (?:|the )homepage$/
     * @override When /^(?:|I )go to (?:|the )homepage$/
     */
    public function iAmOnHomepage()
    {
        $this->visitPageWithParams('home page');
    }

    public function setCookieConsent()
    {
        if ($this->cookieConsented) {
            return;
        }
        $isBannerVisible = $this->getSession()->evaluateScript("document.getElementById('cookie-banner').classList.contains('active')");
        if ($isBannerVisible) {
            $this->iClickElement('#cookie-consent');
        }
        $this->cookieConsented = true;
    }

    private function visitPageWithParams($page, $params = [])
    {
        $this->currentPage = $page;
        $this->navigationContext->getPage($page)->open($params);
        $this->iWait(2);
    }

    private function getCurrentPage()
    {
        if ($this->currentPage) {
            return $this->navigationContext->getPage($this->currentPage);
        }
    }

    private function purgeRabbitMqQueues()
    {
        try {
            $swarrot = $this->getContainer()->get('swarrot.factory.default');
            foreach ($this->queues as $queue) {
                if ($q = $swarrot->getQueue($queue, 'rabbitmq')) {
                    $q->purge();
                }
            }
        } catch (\Exception $exception) {
            echo $exception->getMessage();
        }
    }
}
