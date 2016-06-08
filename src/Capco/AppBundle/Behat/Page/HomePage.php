<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class HomePage extends Page
{
    use PageTrait;

    protected $elements = [
        'Login button' => '.btn.btn--connection',
        'Registration button' => '.btn.btn--registration',
        'Logged user dropdown' => '#navbar-username',
        'Logout button' => '.nav #logout-button',
        'idea' => '.idea__preview',
    ];

    /**
     * @var string
     */
    protected $path = '/';

    public function openLoginModal()
    {
        $this->getElement('Login button')->click();
    }

    public function openUserDropdown()
    {
        $this->getElement('Logged user dropdown')->click();
        sleep(1);
    }

    public function clickLogout()
    {
        $this->openUserDropdown();
        $this->getElement('Logout button')->click();
    }

    public function getIdeaSelector()
    {
        return $this->getSelector('idea');
    }
}
