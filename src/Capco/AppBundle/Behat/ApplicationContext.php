<?php

namespace Capco\AppBundle\Behat;

use Behat\Mink\Exception\ElementNotFoundException;
use Behat\Testwork\Hook\Scope\AfterSuiteScope;
use Behat\Testwork\Tester\Result\TestResult;
use Capco\AppBundle\Behat\Traits\CommentStepsTrait;
use Capco\AppBundle\Behat\Traits\IdeaStepsTrait;
use Capco\AppBundle\Behat\Traits\OpinionStepsTrait;
use Capco\AppBundle\Behat\Traits\ProjectStepsTrait;
use Capco\AppBundle\Behat\Traits\ProposalStepsTrait;
use Capco\AppBundle\Behat\Traits\ReportingStepsTrait;
use Capco\AppBundle\Behat\Traits\SharingStepsTrait;
use Capco\AppBundle\Behat\Traits\SynthesisStepsTrait;
use Capco\AppBundle\Behat\Traits\QuestionnaireStepsTrait;
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
    protected $currentPage;

    use CommentStepsTrait;
    use IdeaStepsTrait;
    use OpinionStepsTrait;
    use ProjectStepsTrait;
    use ProposalStepsTrait;
    use QuestionnaireStepsTrait;
    use ReportingStepsTrait;
    use SharingStepsTrait;
    use SynthesisStepsTrait;

    /**
     * @BeforeScenario
     */
    public function reset($scope)
    {
        // Let's stick with the old way for now
        $jobs = [
            new Process('curl -sS -XDELETE \'http://elasticsearch:9200/_all\''),
            new Process('curl -sS -XBAN http://capco.test/'),
            new Process('redis-cli -h redis FLUSHALL'),
        ];

        $scenario = $scope->getScenario();
        if ($scenario->hasTag('elasticsearch')) {
            $jobs[] = new Process('SYMFONY_ROUTER__REQUEST_CONTEXT__HOST=capco.test php bin/console fos:elastica:populate -e test -n');
        }
        foreach ($jobs as $job) {
            $job->mustRun();
        }
    }

    /**
     * @AfterScenario
     */
    public function resetDatabase($scope)
    {
        $scenario = $scope->getScenario();
        if ($scenario->hasTag('database')) {
            (new Process('mysql -h database -u root symfony < var/db.backup'))->mustRun();
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
        $this->getSession()->getDriver()->evaluateScript('window.sessionStorage.clear();');
        $this->getSession()->getDriver()->evaluateScript('window.localStorage.clear();');
    }

    /**
     * @AfterSuite
     *
     * @param $suiteScope
     */
    public static function notifyEnd(AfterSuiteScope $suiteScope)
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
     * @Given feature :featureA is enabled
     * @Given features :featureA, :featureB are enabled
     * @Given features :featureA, :featureB, :featureC are enabled
     */
    public function featureIsEnabled($featureA, $featureB = null, $featureC = null)
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
     * @When I print html
     */
    public function printHtml()
    {
        echo $this->getSession()->getPage()->getHtml();
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
        $this->currentPage = $page;
        $this->navigationContext->getPage($page)->open($params);
        $this->iWait(2);
    }

    private function getCurrentPage()
    {
        if ($this->currentPage) {
            return $this->navigationContext->getPage($this->currentPage);
        }

        return;
    }
}
