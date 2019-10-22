<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class OpinionListPage extends Page
{
    use PageTrait;

    protected $path = '/projects/{projectSlug}/consultation/{stepSlug}/{consultationSlug}/types/{opinionTypeSlug}';

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        if (!$this->getSession()->wait(6000, "$('#opinion-ordering-selector').length > 0")) {
            throw new \RuntimeException(
                'OpinionListPage did not fully load, check selector in "verifyPage".'
            );
        }
    }
}
