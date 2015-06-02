<?php

namespace Capco\AppBundle\Behat;

use Capco\AppBundle\Toggle\Manager;

class ApplicationContext extends UserContext
{
    protected $headers;

    /**
     * @BeforeSuite
     */
    public static function reinitDatabase()
    {
        exec('app/console capco:reinit --force -e test');
    }

    /**
     * @AfterScenario @database
     */
    public static function databaseContainsFixtures()
    {
        exec('php app/console doctrine:database:drop --force -e test');
        exec('php app/console doctrine:database:create -e test');
        exec('php app/console doctrine:schema:update --force -e test');
        exec('php app/console doctrine:fixtures:load -n -e test');
        exec('php app/console capco:recalculate-counters -e test');
        exec('php app/console capco:recalculate-consultations-counters -e test');
    }

    /**
     * @AfterSuite
     */
    public static function reinitFeatures()
    {
        exec('php app/console capco:reset-feature-flags --force');
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
        expect(array_search($first, $items) > array_search($second, $items));
    }

    /**
     * @When I click the :element element
     */
    public function iClickElement($element)
    {
        $something = $this->getSession()->getPage()->find('css', $element)->click();
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
     * @When I try to download :url
     */
    public function iTryToDownload($url)
    {
        $this->headers = get_headers($this->getSession()->getCurrentUrl().$url);
    }

    /**
     * @Then /^I should see response status code "([^"]*)"$/
     */
    public function iShouldSeeResponseStatusCode($statusCode)
    {
        $responseStatusCode = $this->response->getStatusCode();
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
}
