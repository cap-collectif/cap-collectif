<?php

namespace Capco\AppBundle\Behat\Page;

use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class Eventpage extends Page
{
    /**
     * @var string $path
     */
    protected $path = '/events/{slug}';
}
