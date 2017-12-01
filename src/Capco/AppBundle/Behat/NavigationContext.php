<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\TableNode;
use SensioLabs\Behat\PageObjectExtension\Context\PageObjectContext;

class NavigationContext extends PageObjectContext
{
    public function iVisitedPage($pageName)
    {
        $this->getPage($pageName)->open();
    }

    public function iVisitedPageWith($pageName, TableNode $parameters)
    {
        $this->getPage($pageName)->open($parameters->getRowsHash());
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
    public function theFirstSourceVoteCounterShouldBe(int $value)
    {
        expect($this->getPage('opinion page')->getFirstSourceVoteCounter())->toBe($value);
    }

    /**
     * @Then The first comment vote counter should be :value
     */
    public function theFirstCommentVoteCounterShouldBe(int $value)
    {
        expect($this->getPage('idea page')->getFirstCommentVoteCounter())->toBe($value);
    }
}
