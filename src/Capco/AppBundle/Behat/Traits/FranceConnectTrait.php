<?php

namespace Capco\AppBundle\Behat\Traits;

use PHPUnit\Framework\Assert;

trait FranceConnectTrait
{
    /**
     * @Then I should see the France Connect login screen
     */
    public function IShouldSeeTheFranceConnectLoginScreen()
    {
        $this->assertSession()->addressMatches('/^\/api\/v1\/authorize/i');
        $this->assertSession()->elementExists('css', '#authentication-page');
    }

    public function IShouldSeeTheFranceConnectInteractionScreen()
    {
        $this->assertSession()->addressMatches('/^\/interaction\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/i');
    }

    private function IJumpToFranceConnectLoginScreen()
    {
        $this->getSession()->visit('https://capco.test/login/franceconnect?_destination=https://capco.test/');
        $this->IShouldSeeTheFranceConnectLoginScreen();
    }

    private function IAuthenticateFranceConnectIP(string $id)
    {
        $this->IJumpToFranceConnectLoginScreen();
        $this->iClickOnButton($id);
        $this->IShouldSeeTheFranceConnectInteractionScreen();

        $this->iClickOnButton('[value="Valider"]');
    }

    /**
     * @Given I am on the France Connect authentication page of an identity provider with the appropriate level of eIDAS trust
     */
    public function IAmOnTheFranceConnectAuthPageOfAnIP()
    {
        $this->IAuthenticateFranceConnectIP("#fi-identity-provider-example");
    }

    /**
     * @Then I authenticate France Connect and validate
     */
    public function IAuthenticateFranceConnectAndValidate()
    {
        $this->IShouldSeeTheFranceConnectLoginScreen();
        $this->iClickOnButton('[value="Continuer sur CAP COLLECTIF - 835"]');
    }
}
