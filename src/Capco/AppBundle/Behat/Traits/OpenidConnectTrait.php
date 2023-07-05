<?php

namespace Capco\AppBundle\Behat\Traits;

trait OpenidConnectTrait
{
    /**
     * @Then I should see the Openid Connect login screen
     */
    public function IShouldSeeTheOpenidConnectLoginScreen()
    {
        $this->assertSession()->addressMatches(
            '/^\/auth\/realms\/master\/protocol\/openid-connect\/auth/i'
        );
    }

    /**
     * @When I authenticate with openid
     */
    public function iAuthenticateWithOpenid()
    {
        $this->IJumpToOpenidLoginScreen();

        $username = $this->getParameter('openid_test_username');
        $password = $this->getParameter('openid_test_password');
        $this->fillField('username', $username);
        $this->fillField('password', $password);

        $this->getSession()
            ->getPage()
            ->find('css', '#kc-login')
            ->click()
        ;
    }

    /**
     * @When I go to my sso profile
     */
    public function iGoToMySsoProfile()
    {
        $this->getSession()->visit('https://capco.test/sso/profile?referrer=https://capco.test/');
    }

    private function IJumpToOpenidLoginScreen()
    {
        $this->getSession()->visit(
            'https://capco.test/login/openid?_destination=https://capco.test/'
        );
        $this->IShouldSeeTheOpenidConnectLoginScreen();
    }
}
