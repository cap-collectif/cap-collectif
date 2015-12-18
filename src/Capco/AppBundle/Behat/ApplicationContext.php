<?php

namespace Capco\AppBundle\Behat;

use Behat\Mink\Exception\ElementNotFoundException;
use Behat\Testwork\Hook\Scope\AfterSuiteScope;
use Behat\Testwork\Tester\Result\TestResult;
use Capco\AppBundle\Toggle\Manager;
use Joli\JoliNotif\Notification;
use Joli\JoliNotif\NotifierFactory;
use WebDriver\Exception\ElementNotVisible;

class ApplicationContext extends UserContext
{
    protected $headers;

    /**
     * @BeforeSuite
     */
    public static function reinitDatabase()
    {
        exec('app/console capco:reinit --force -e test');
        $exportCommand = 'mysqldump --opt -h 127.0.0.1 -u root symfony_test > app/dbtest.backup';
        exec($exportCommand);
    }

    /**
     * @BeforeScenario @purge
     *
     * Purge database
     */
    public static function purgeDatabase()
    {
        exec('app/console doctrine:database:drop --force -e test');
        exec('app/console doctrine:schema:update --force -e test');
    }

    /**
     * @AfterScenario @database
     *
     * Recreate database before loading fixtures to make sure we always have the same ids
     */
    public static function databaseContainsFixtures()
    {
        $importCommand = 'mysql -h 127.0.0.1 -u root symfony_test < app/dbtest.backup';
        exec($importCommand);
        exec('app/console capco:reset-feature-flags -e test');
        exec('app/console capco:compute:counters -e test');
        exec('app/console capco:compute:projects-counters -e test');
        exec('app/console capco:compute:rankings -e test');
        exec('app/console fos:elastica:populate -q -e test');
    }

    /**
     * @AfterScenario @javascript
     */
    public function clearLocalStorage()
    {
        $this->getSession()->getDriver()->evaluateScript(
            'localStorage.clear();'
        );
    }

    /**
     * @AfterSuite
     */
    public static function reinitFeatures()
    {
        exec('php app/console capco:reset-feature-flags --force');
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
     * @BeforeScenario
     */
    public function resetFeatures()
    {
        $this->getService('capco.toggle.manager')->deactivateAll();
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
     * @When I submit a :type argument with text :text
     */
    public function iSubmitAnArgument($type, $text)
    {
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
    public function iClickElement($element)
    {
        $this->getSession()->getPage()->find('css', $element)->click();
    }

    /**
     * @When I hover over the :element element
     */
    public function iHoverOverTheElement($element)
    {
        $this->getSession()->getPage()->find('css', $element)->mouseOver();
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
        $time = intval($seconds * 1000);
        $this->getSession()->wait($time);
    }

    /**
     * @When I try to download :path
     */
    public function iTryToDownload($path)
    {
        $url = $this->getSession()->getCurrentUrl().$path;
        $this->headers = get_headers($url);
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
}
