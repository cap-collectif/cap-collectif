<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminUserListPage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/user/user/list';

    protected $elements = [
        'create user button' => '#add-a-user',
        'submit user' => '#confirm-user-create',
    ];

    public function clickCreateUserButton()
    {
        $this->getElement('create user merge button')->click();
    }

    public function clickSubmitUserButton()
    {
        $this->getElement('submit user merge')->click();
    }
}
