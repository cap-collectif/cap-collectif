<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class DeveloperCategoryTypePage extends Page
{
    use PageTrait;

    protected $path = '/developer/{category}/{type}';
}
