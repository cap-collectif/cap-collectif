<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class SectionPage extends Page
{
    use PageTrait;

    protected $path = '/project/{projectSlug}/consultation/{stepSlug}/types/{sectionSlug}';

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        // TODO: replace this by a real condition to optimize loading time
        if (!$this->getSession()->wait(2000, 'true')) {
            throw new \RuntimeException(
                'SectionPage did not fully load, check selector in "verifyPage".'
            );
        }
    }
}
