<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ProjectTrashedPage extends Page
{
    use PageTrait;

    protected $path = '/projects/{projectSlug}/trashed';

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        if (
            !$this->getSession()->wait(
                10000,
                "window.jQuery && $('.project__show-trash').length > 0"
            )
        ) {
            throw new \RuntimeException(
                'ProjectTrashedPage did not fully load, check selector in "verifyPage".'
            );
        }
    }
}
