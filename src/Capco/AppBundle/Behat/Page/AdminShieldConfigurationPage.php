<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminShieldConfigurationPage extends Page
{
    use PageTrait;

    protected $path = '/admin/settings/pages.shield/list';

    protected $elements = [
        'save button' => '#shield-admin-form_submit',
        'shield admin form toggle' => '#shield-admin-form .form-group .elegant-toggle',
        'toggle france connect' => '#toggle-franceConnect',
        'toggle oauth2' => 'input[for=\'Oauth2\']'
    ];

    public function toggleOauth()
    {
        $this->getElement('toggle oauth2')->click();
    }

    public function toggleFranceConnect()
    {
        $this->getElement('toggle france connect')->click();
    }

    public function clickSaveButton()
    {
        $this->getElement('save button')->click();
    }

    public function clickOnButtonOrRadio(string $element)
    {
        $this->getElement($element)->click();
    }
}
