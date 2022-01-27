<?php

namespace Capco\AppBundle\Behat\Page;

use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ManageFollowingsPage extends Page
{
    protected $path = '/profile/edit-profile#followings';


    public function verifyPage()
    {
        if (!$this->getSession()->wait(10000, "window.jQuery && $('#account-tabs-pane-followings').length > 0")) {
            throw new \RuntimeException(
                'ManageFollowingsPage did not fully load, check selector in "verifyPage".'
            );
        }
    }
}
