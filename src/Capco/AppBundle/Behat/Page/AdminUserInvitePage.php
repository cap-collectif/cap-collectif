<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminUserInvitePage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/user/invite/list';
}
