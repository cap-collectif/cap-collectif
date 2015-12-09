<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\TableNode;
use SensioLabs\Behat\PageObjectExtension\Context\PageObjectContext;

class NavigationContext extends PageObjectContext
{
    /**
     * @When I go on the sources tab
     */
    public function iGoOnTheSourcesTab()
    {
        $this->getPage('opinion page')
             ->clickSourcesTab();
        sleep(3);
    }

    /**
     * @When I go on the arguments tab
     */
    public function iGoOnTheArgumentsTab()
    {
        $this->getPage('opinion page')->clickArgumentsTab();
    }

    /**
     * @When I go on the connections tab
     */
    public function iGoOnTheConnectionsTab()
    {
        $this->getPage('opinion page')
            ->clickConnectionsTab();
        sleep(3);
    }

    /**
     * @When I want to add a source
     */
    public function clickAddSourceTab()
    {
        $this->getPage('opinion page')
             ->clickAddSource();
    }

    /**
     * @Given I visited :pageName
     */
    public function iVisitedPage($pageName)
    {
        $this->getPage($pageName)->open();
    }

    /**
     * @Given I visited :pageName with:
     */
    public function iVisitedPageWith($pageName, TableNode $parameters)
    {
        $this->getPage($pageName)->open($parameters->getRowsHash());
    }

    /**
     * @When I vote for the first source
     */
    public function iVoteForTheFirstSource()
    {
        $this->getPage('opinion page')
             ->voteForFirstSource();
    }

    /**
     * @When I vote for the first comment
     */
    public function iVoteForTheFirstComment()
    {
        $this->getPage('idea page')
             ->voteForFirstComment();
    }

    /**
     * @Then The first source vote counter should be :value
     */
    public function theFirstSourceVoteCounterShouldBe($value)
    {
        expect($this->getPage('opinion page')->getFirstSourceVoteCounter())->toBe($value);
    }

    /**
     * @Then The first comment vote counter should be :value
     */
    public function theFirstCommentVoteCounterShouldBe($value)
    {
        expect($this->getPage('idea page')->getFirstCommentVoteCounter())->toBe($value);
    }
}
