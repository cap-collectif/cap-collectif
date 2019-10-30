<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ProjectPostsPage extends Page
{
    use PageTrait;

    protected $path = '/projects/{projectSlug}/posts';

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        if (!$this->getSession()->wait(10000, "window.jQuery && $('.media-list').length > 0")) {
            throw new \RuntimeException(
                'ProjectPostsPage did not fully load, check selector in "verifyPage".'
            );
        }
    }
}
