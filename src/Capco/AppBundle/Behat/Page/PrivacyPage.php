<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class PrivacyPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/privacy';
}
