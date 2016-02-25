<?php

namespace Capco\AppBundle\Behat\Traits;

trait SharingStepsTrait
{
    /**
     * I should see the share dropdown.
     *
     * @Then I should see the share dropdown
     */
    public function iShouldSeeTheShareDropdown()
    {
        $this->assertElementOnPage(".dropdown-menu");
        $this->assertElementContainsText(".share-button-dropdown", "Facebook");
        $this->assertElementContainsText(".share-button-dropdown", "Lien de partage");
    }

    /**
     * I click the share link button.
     *
     * @When I click the share link button
     */
    public function iClickTheShareLinkButton()
    {
        $this->clickLink("Lien de partage");
        $this->iWait(1);
    }

    /**
     * I should see the share link modal.
     *
     * @Then I should see the share link modal
     */
    public function iShouldSeeTheShareLinkModal()
    {
        $this->assertElementOnPage(".modal--share-link");
    }
}
