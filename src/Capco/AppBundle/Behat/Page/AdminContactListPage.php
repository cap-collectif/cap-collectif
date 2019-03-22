<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminContactListPage extends Page
{
    use PageTrait;

    protected $path = '/admin/contact/list';

    protected $elements = [
        'save button' => 'button[type="submit"]',
    ];

    public function clickSaveButton()
    {
        $this->getElement('save button')->click();
    }
}
