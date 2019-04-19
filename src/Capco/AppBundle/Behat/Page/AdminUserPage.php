<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminUserPage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/user/user/{userId}/edit';

    protected $elements = [
        'user profile tab' => '#UserAdminPageTabs-tab-2',
        'user data tab' => '#UserAdminPageTabs-tab-3',
        'user password tab' => '#UserAdminPageTabs-tab-4',
    ];

    public function clickSaveUserContentButton()
    {
        $this->getElement('user save')->click();
    }
}
