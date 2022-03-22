<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class EventPage extends Page
{
    use PageTrait;

    protected $path = '/events/{slug}';

    public function verifyPage()
    {
        if (
            !$this->getSession()->wait(10000, "window.jQuery && $('.eventHeader').length > 0")
        ) {
            throw new \RuntimeException(
                'EventPage did not fully load, check selector in "verifyPage".'
            );
        }
    }
}
