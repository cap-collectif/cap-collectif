<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ContactPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/contact';

    public function verifyPage()
    {
        if (
            !$this->getSession()->wait(
                10000,
                "window.jQuery && $('.contact__form__list button:first-of-type').length > 0"
            )
        ) {
            throw new \RuntimeException(
                'ContactPage did not fully load, check selector in "verifyPage".'
            );
        }
    }
}
