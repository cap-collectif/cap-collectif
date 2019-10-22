<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class SectionPage extends Page
{
    use PageTrait;

    protected $path = '/project/{projectSlug}/consultation/{stepSlug}/{consultationSlug}/types/{sectionSlug}';

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        if (
            !$this->getSession()->wait(
                10000,
                "window.jQuery && $('.opinion-list-rendered').length > 0"
            )
        ) {
            throw new \RuntimeException(
                'SectionPage did not fully load, check selector in "verifyPage".'
            );
        }
    }
}
