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
        'Logout button' => '#logout-button',
    ];

    /**
     * @var string
     */
    protected $path = '/';

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        if (
            !$this->getSession()->wait(
                10000,
                "($('#main-navbar').length + $('#shield-mode').length) > 0"
            )
        ) {
            throw new \RuntimeException('HomePage did not fully load, check selector in "verifyPage".');
        }
    }

    public function openLoginModal()
    {
        $this->getElement('Login button')->click();
    }

    public function openUserDropdown()
    {
        $this->getElement('Logged user dropdown')->click();
        sleep(1);
    }

    public function clickLogout(): void
    {
        $this->openUserDropdown();
        $this->getElement('Logout button')->click();
    }
}
