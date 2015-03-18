<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class Eventpage extends Page
{
    use PageTrait;

    /**
     * @var string $path
     */
    protected $path = '/events/{slug}';
}
