<?php

namespace Capco\AppBundle\Behat\Page;

use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class IdeaPage extends Page
{
    /**
     * @var string $path
     */
    protected $path = '/ideas/{slug}';
}
