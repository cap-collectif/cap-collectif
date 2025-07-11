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
                15000,
                "document.querySelectorAll('main#contact-page').length > 0"
            )
        ) {
            throw new \RuntimeException('ContactPage did not fully load, check selector in "verifyPage".');
        }
    }
}
