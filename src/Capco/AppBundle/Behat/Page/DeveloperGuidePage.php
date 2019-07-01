<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class DeveloperGuidePage extends Page
{
    use PageTrait;

    protected $path = '/developer/guides/{guide}';
}
