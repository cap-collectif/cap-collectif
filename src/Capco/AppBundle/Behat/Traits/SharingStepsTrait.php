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
        $this->assertElementOnPage('.dropdown-menu');
        $this->assertElementOnPage('.share-button-dropdown');
        $this->assertElementContainsText('.share-button-dropdown', 'share.facebook');
        $this->assertElementContainsText('.share-button-dropdown', 'share.link');
    }

    /**
     * I should see the opinion share dropdown.
     *
     * @Then I should see the opinion share dropdown
     */
    public function iShouldSeeTheOpinionShareDropdown()
    {
        $this->assertElementOnPage('.opinion__description .dropdown-menu');
        $this->assertElementOnPage('.opinion__description .share-button-dropdown');
        $this->assertElementContainsText('.opinion__description .share-button-dropdown', 'share.facebook');
        $this->assertElementContainsText('.opinion__description .share-button-dropdown', 'share.link');
    }

    /**
     * I click the share link button.
     *
     * @When I click the share link button
     */
    public function iClickTheShareLinkButton()
    {
        $this->clickLink('share.link');
        $this->iWait(1);
    }

    /**
     * I click the opinion share link button.
     *
     * @When I click the opinion share link button
     */
    public function iClickTheOpinionShareLinkButton()
    {
        $dropdown = $this->getCurrentPage()->find('css', '.opinion__description .share-button-dropdown');
        $dropdown->clickLink('share.link');
        $this->iWait(1);
    }

    /**
     * I should see the share link modal.
     *
     * @Then I should see the share link modal
     */
    public function iShouldSeeTheShareLinkModal()
    {
        $this->assertElementOnPage('.modal--share-link');
    }
}
