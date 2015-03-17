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
}
