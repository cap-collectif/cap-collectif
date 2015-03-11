<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\TableNode;

class UserContext extends DefaultContext
{
    /**
     * @Given I am logged out
     */
    public function iAmLoggedOut()
    {
        $this->navigationContext->iVisitedPage('logoutPage');
    }

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
        $this->navigationContext->iVisitedPage('loginPage');
        $this->fillField('_username', $email);
        $this->fillField('_password', $pwd);
        $this->pressButton('Se connecter');

    }

}
