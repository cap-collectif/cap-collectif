<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminUserListPage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/user/user/list';

    protected $elements = [
        'user create button' => '#add-a-user-button',
        'submit user' => '#confirm-user-create',
    ];

    public function clickSubmitUserButton()
    {
        $this->getElement('submit user merge')->click();
    }

    public function openModalToCreateUser()
    {
        $this->pressButton('add-a-user');
    }
}
