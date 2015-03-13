<?php

namespace Capco\AppBundle\Behat\Page;

use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class NewsPage extends Page
{
    /**
     * @var string $path
     */
    protected $path = '/blog/{slug}';
}
