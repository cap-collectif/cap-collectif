<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminOpinionVersionListPage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/opinionversion/list';
}
