<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class NewsPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/blog/{slug}';
}
