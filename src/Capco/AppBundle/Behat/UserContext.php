<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\TableNode;
use Behat\Mink\Driver\BrowserKitDriver;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

class UserContext extends DefaultContext
{
    /**
     * @Given I am logged in as admin
     */
    public function iAmLoggedInAsAdmin()
    {
        $this->logInWith('admin@test.com', 'admin');
    }

    /**
     * @Given I am logged in as user
     */
    public function iAmLoggedInAsUser()
    {
        $this->logInWith('user@test.com', 'user');
    }

    private function logInWith($email, $pwd)
    {
        $this->navigationContext->iVisitedPage('loginpage');
        $this->fillField('_username', $email);
        $this->fillField('_password', $pwd);
        $this->pressButton('Se connecter');

    }

}
