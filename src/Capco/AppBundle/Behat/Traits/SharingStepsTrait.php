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
        $this->assertElementOnPage('.share-dropdown-button');
        $this->assertElementOnPage('.share-button-dropdown');
        $this->assertElementContainsText('.share-button-dropdown', 'share.facebook');
        $this->assertElementContainsText('.share-button-dropdown', 'share.link');
    }

    /**
     * @When I click the share link button
     */
    public function iClickTheShareLinkButton()
    {
        $this->iWait(1);
        $this->clickLink('share.link');
        $this->iWait(1);
    }

    /**
     * @Then I should see the share link modal
     */
    public function iShouldSeeTheShareLinkModal()
    {
        $this->waitAndThrowOnFailure(3000, "$('.modal--share-link').length > 0");
        $this->assertElementOnPage('.modal--share-link');
    }
}
