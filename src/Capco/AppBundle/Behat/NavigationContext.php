<?php

namespace Capco\AppBundle\Behat;


use SensioLabs\Behat\PageObjectExtension\Context\PageObjectContext;


class NavigationContext extends PageObjectContext
{
    /**
     * @Given /^(?:|I )visited (?:|the )(?P<pageName>.*?)$/
     */
    public function iVisitedThePage($pageName)
    {
        $this->getPage($pageName)->open();
    }
}
