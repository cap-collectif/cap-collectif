<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminEventCreatePage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/event/create';

    public function verifyPage()
    {
        if (!$this->getSession()->wait(10000, "window.jQuery && $('#event_title').length > 0")) {
            throw new \RuntimeException('AdminEventCreatePage did not fully load, check selector in "verifyPage".');
        }
    }
}
