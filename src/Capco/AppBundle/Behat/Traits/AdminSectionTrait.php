<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminSectionTrait
{
    /**
     * @When I click on the admin multilangue dropddown navbar item with english locale
     */
    public function iClickOnTheAdminMultilangueDropdownNavbarItemWithEnglishLocale()
    {
        $this->selectNthItemFromMultilangueDropdown(1);
    }

    /**
     * @When I click on the admin multilangue dropddown navbar item with french locale
     */
    public function iClickOnTheAdminMultilangueDropdownNavbarItemWithFrenchLocale()
    {
        $this->selectNthItemFromMultilangueDropdown(2);
    }

    private function selectNthItemFromMultilangueDropdown(int $nth)
    {
        $dropdown = '#admin-multilangue-dropdown-navbar';

        $this->iWaitElementToAppearOnPage($dropdown);
        $this->iClickElement($dropdown);
        $this->iWaitElementToAppearOnPage("${dropdown} + ul > li:nth-of-type(${nth}) > a");
        $this->iClickElement("${dropdown} + ul > li:nth-of-type(${nth}) > a");
    }
}
