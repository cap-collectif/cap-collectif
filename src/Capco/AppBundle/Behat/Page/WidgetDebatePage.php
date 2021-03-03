<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class WidgetDebatePage extends Page
{
    use PageTrait;

    protected $path = '/widget_debate/{debateId}';

    public function verifyPage()
    {
        if (
            !$this->getSession()->wait(
                10000,
                'document.body.innerHTML.search("Je suis un super Widget") > 0'
            )
        ) {
            throw new \RuntimeException(
                'WidgetDebatePage did not fully load, check selector in "verifyPage".'
            );
        }
    }
}
