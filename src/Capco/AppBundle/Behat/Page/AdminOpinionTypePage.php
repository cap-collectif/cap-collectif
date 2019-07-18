<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\Traits\AdminOpinionTypeTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminOpinionTypePage extends Page
{
    use AdminOpinionTypeTrait;

    protected $path = '/admin/capco/app/opiniontype/{opinionTypeId}/edit';
}
