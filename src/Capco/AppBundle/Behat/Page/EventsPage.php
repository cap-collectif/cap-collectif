<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class EventsPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/events';

    public function verifyPage()
    {
        if (!$this->getSession()->wait(10000, "window.jQuery && $('.eventPreview').length > 0")) {
            throw new \RuntimeException('EventsPage did not fully load, check selector in "verifyPage".');
        }
    }
}
