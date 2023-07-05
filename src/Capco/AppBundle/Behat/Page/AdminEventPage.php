<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminEventPage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/event/{eventId}/edit';

    public function verifyPage()
    {
        if (!$this->getSession()->wait(10000, "window.jQuery && $('#event_title').length > 0")) {
            throw new \RuntimeException('AdminEventPage did not fully load, check selector in "verifyPage".');
        }
    }
}
