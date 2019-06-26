<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminProjectTypePage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/projecttype/list';
}
