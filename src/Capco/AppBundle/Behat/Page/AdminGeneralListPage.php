<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminGeneralListPage extends Page
{
    use PageTrait;

    protected $path = '/admin/settings/settings.global/list';
}
