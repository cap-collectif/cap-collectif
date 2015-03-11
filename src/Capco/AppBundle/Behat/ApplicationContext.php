<?php

namespace Capco\AppBundle\Behat;


use Behat\Mink\Exception\Exception;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\ElementNotFoundException;

class ApplicationContext extends UserContext
{
    /**
     * @BeforeSuite
     * @Given database contains fixtures
     */
    public static function databaseContainsFixtures()
    {
        exec('php app/console doctrine:fixtures:load -n -e test');
    }

    /**
     * @Given all features are enabled
     */
    public function allFeaturesAreEnabled()
    {
        exec('php app/console capco:reinit-feature-flags --force');
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

}
