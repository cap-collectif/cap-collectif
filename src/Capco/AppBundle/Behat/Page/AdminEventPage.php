<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminEventPage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/event/{eventId}/edit';
}
