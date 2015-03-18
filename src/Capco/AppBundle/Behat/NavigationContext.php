<?php

namespace Capco\AppBundle\Behat;


use Behat\Gherkin\Node\TableNode;
use SensioLabs\Behat\PageObjectExtension\Context\PageObjectContext;


class NavigationContext extends PageObjectContext
{
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
     * @When I vote for an idea
     */
    public function iVoteForAnIdea()
    {
        $this->getPage("idea page")
             ->open(['slug' => 'ideacommentable'])
             ->vote();
    }

    /**
     * @Then The idea vote counter should be :value
     */
    public function theIdeaVoteCounterShouldBe($value)
    {
        expect($this->getPage("idea page")->getVoteCounterValue())->toBe($value);
    }

    /**
     * @When I collapse sources list
     */
    public function iCollapseSourcesList()
    {
        $this->getPage("opinion page")
             ->collapseSourcesList();
        sleep(1);
    }

    /**
     * @When I vote for the first source
     */
    public function iVoteForFirstSource()
    {
        $this->getPage("opinion page")
             ->voteForFirstSource();
    }

    /**
     * @When I vote for the first comment
     */
    public function iVoteForTheFirstComment()
    {
        $this->getPage("idea page")
             ->voteForFirstComment();
    }

    /**
     * @Then The first comment vote counter should be :value
     */
    public function theFirstCommentVoteCounterShouldBe($value)
    {
        expect($this->getPage("idea page")->getFirstCommentVoteCounter())->toBe($value);
    }

}
