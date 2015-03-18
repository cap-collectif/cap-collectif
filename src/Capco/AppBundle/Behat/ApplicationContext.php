<?php

namespace Capco\AppBundle\Behat;


use Behat\Mink\Exception\Exception;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\ElementNotFoundException;
use Capco\AppBundle\Toggle\Manager;

class ApplicationContext extends UserContext
{
    /**
     * @BeforeSuite
     * @AfterScenario @database
     */
    public static function databaseContainsFixtures()
    {
        exec('php app/console doctrine:fixtures:load -n -e test');
    }

    /**
     * @AfterSuite
     */
    public static function reinitFeatures()
    {
        exec('php app/console capco:reinit-feature-flags --force');
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
     * @Then I should see :element from :page
     */
    public function iShouldSeeElementInPage($element, $page)
    {
        $this->navigationContext->getPage($page)->getElement($element);
    }

    /**
     * @Then I should not see :element from :page
     */
    public function iShouldNotSeeElementInPage($element, $page)
    {
        try {
            $result = $this->navigationContext->getPage($page)->getElement($element);
        } catch (ElementNotFoundException $e) {
            return;
        }
        throw new \Exception(
            'Element '.$element.' is present on the page.'
        );
    }

    /**
     * @When I click the :element element
     */
    public function iClickElement($element)
    {
        $something = $this->getSession()->getPage()->find("css", $element)->click();
    }

    /**
     * @When I wait :seconds seconds
     */
    public function iWait($seconds)
    {
        $time = intval($seconds * 1000);
        $this->getSession()->wait($time);
    }

}
