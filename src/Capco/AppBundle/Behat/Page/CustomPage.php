<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class CustomPage extends Page
{
    use PageTrait;

    protected $path = '/pages/{slug}';
}
