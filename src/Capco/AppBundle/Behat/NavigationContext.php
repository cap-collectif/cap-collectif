<?php

namespace Capco\AppBundle\Behat;


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
}
