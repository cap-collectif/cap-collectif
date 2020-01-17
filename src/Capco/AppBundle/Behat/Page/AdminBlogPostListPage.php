<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminBlogPostListPage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/post/list';

    protected $elements = [
    ];
}
