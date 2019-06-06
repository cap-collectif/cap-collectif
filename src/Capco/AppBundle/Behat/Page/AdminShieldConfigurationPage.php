<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminShieldConfigurationPage extends Page
{
    use PageTrait;

    protected $path = '/admin/settings/pages.shield/list';

    protected $elements = [
        'save button' => 'button[type="submit"]',
        'shield admin form toggle' => '#shield-admin-form .form-group .react-toggle',
    ];

    public function clickSaveButton()
    {
        $this->getElement('save button')->click();
    }

    public function clickOnButtonOrRadio(string $element)
    {
        $this->getElement($element)->click();
    }
}
