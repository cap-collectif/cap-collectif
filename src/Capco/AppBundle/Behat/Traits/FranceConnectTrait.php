<?php

namespace Capco\AppBundle\Behat\Traits;

trait FranceConnectTrait
{
    /**
     * @Then I should see the France Connect login screen
     */
    public function IShouldSeeTheFranceConnectLoginScreen()
    {
        $this->assertSession()->addressMatches('/^\/api\/v1\/authorize/i');
    }

    public function IShouldSeeTheFranceConnectInteractionScreen()
    {
        $this->assertSession()->addressMatches(
            '/^\/interaction\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/i'
        );
    }

    /**
     * @Given I am on the France Connect authentication page of an identity provider with the appropriate level of eIDAS trust
     */
    public function IAmOnTheFranceConnectAuthPageOfAnIP()
    {
        $this->IAuthenticateFranceConnectIP('#fi-identity-provider-example');
    }

    /**
     * @Then I authenticate France Connect and validate
     */
    public function IAuthenticateFranceConnectAndValidate()
    {
        $this->IShouldSeeTheFranceConnectLoginScreen();

        $this->getSession()
            ->getPage()
            ->find('css', 'button.content__continue')
            ->click();
    }

    /**
     * @When I dissociate from FranceConnect
     */
    public function IDissociateFromFranceConnect()
    {
        $this->waitAndThrowOnFailure(1000, '$("#dissociate-event-FRANCE_CONNECT").length > 0');
        $this->iClickElement('#dissociate-event-FRANCE_CONNECT');

        $this->assertPageContainsText('unlink-account');
        $this->iClickElement('#dissociate-confirm');
    }

    /**
     * @When I should be disconnected from FranceConnect
     */
    public function IShouldBeDisconnectedFromFranceConnect()
    {
        $this->visit('https://fcp.integ01.dev-franceconnect.fr/traces/');
        $this->waitAndThrowOnFailure(3000, "$('#fc-traces-not-authenticated').length > 0");
    }

    /**
     * @When The fields gender, lastname, firstname and birthdate, birthplace are not updatable
     */
    public function theFieldsAreNotUpdatable()
    {
        $this->theFieldShouldBeDisabled('#personal-data-form-firstname');
        $this->theFieldShouldBeDisabled('#month');
        $this->theFieldShouldBeDisabled('#personal-data-form-birthPlace');
        $this->theFieldShouldBeDisabled('#personal-data-form-lastname');
    }

    private function IJumpToFranceConnectLoginScreen()
    {
        $this->getSession()->visit(
            'https://capco.test/login/franceconnect?_destination=https://capco.test/'
        );
        $this->IShouldSeeTheFranceConnectLoginScreen();
    }

    private function IAuthenticateFranceConnectIP(string $id)
    {
        $this->IJumpToFranceConnectLoginScreen();
        $this->getSession()
            ->getPage()
            ->find('css', $id)
            ->click();
        $this->IShouldSeeTheFranceConnectInteractionScreen();

        $this->getSession()
            ->getPage()
            ->find('css', '[value="Valider"]')
            ->click();
    }
}
