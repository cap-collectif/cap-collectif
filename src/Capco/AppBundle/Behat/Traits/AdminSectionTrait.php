<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminSectionTrait
{
    /**
     * @When I click on the admin multilangue dropddown navbar item with english locale
     */
    public function iClickOnTheAdminMultilangueDropdownNavbarItemWithEnglishLocale()
    {
        $this->selectNthItemFromMultilangueDropdown(2);
    }

    /**
     * @When I click on the admin multilangue dropddown navbar item with french locale
     */
    public function iClickOnTheAdminMultilangueDropdownNavbarItemWithFrenchLocale()
    {
        $this->selectNthItemFromMultilangueDropdown(3);
    }

    private function selectNthItemFromMultilangueDropdown(int $nth)
    {
        $dropdownButton = '#admin-multilangue-dropdown-navbar';
        $dropdown = '#admin-multilangue-dropdown';

        $this->iWaitElementToAppearOnPage($dropdownButton);
        $this->iClickElement($dropdownButton);
        $this->iWaitElementToAppearOnPage("${dropdown}  > a:nth-of-type(${nth}) ");
        $this->iClickElement("${dropdown} > a:nth-of-type(${nth}) ");
    }
}
