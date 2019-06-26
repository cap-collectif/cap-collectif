<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminProjectSourcePage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/category/list';
}
