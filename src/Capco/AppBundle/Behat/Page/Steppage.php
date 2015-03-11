<?php

namespace Capco\AppBundle\Behat\Page;

use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class StepPage extends Page
{
    /**
     * @var string $path
     */
    protected $path = '/themes/{slug}';


}
