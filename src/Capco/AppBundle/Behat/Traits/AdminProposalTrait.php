<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminProposalTrait
{
    /**
     * @When I change the proposals Category
     */
    public function iChangeTheProposalsCategory()
    {
        $this->selectOption('category', 'Politique');
        $this->iWait(2);
    }

    /**
     * @When I save current admin content proposal
     */
    public function iSaveTheProposalContent()
    {
        $this->getCurrentPage()->clickSaveProposalContentButton();
    }

    /**
     * @When I go to the admin proposal advancement tab
     */
    public function iGoToTheAdminProposalAdvancementTab()
    {
        $page = $this->getCurrentPage();
        $this->iWait(3); // Wait alert to disappear
        $this->getSession()->wait(3000, "$('" . $page->getSelector('proposal advancement tab') . "').length > 0");
        $page->clickAdvancementTab();
        $this->iWait(1);
    }

    /**
     * @When I toggle a proposal advancement :elementName
     */
    public function iToggleAProposalAdvancementButton(string $elementName)
    {
        $page = $this->getCurrentPage();
        $this->iWait(3);
        $page->toggleProposalElement($elementName);
        $this->iWait(3);
    }

    /**
     * @When I change the proposal advancement select :select with option :value
     */
    public function iChangeTheProposalAdvancementSelect(string  $select, string $value)
    {
        $this->getCurrentPage()->selectProposalAdvancementStatus($value, $select);
        $this->iWait(1);
    }

    /**
     * @When I save current proposal admin advancement
     */
    public function iSaveTheProposalAdminAdvancement()
    {
        $this->getCurrentPage()->clickSaveProposalAdvancementButton();
    }

    /**
     * @When I fill the proposal content address with :address
     */
    public function iFillProposalContentAddressWith(string $address)
    {
        $this->fillField('proposal_address', $address);
        $this->iWait(1);
        $this->iClickElement('#PlacesAutocomplete__autocomplete-container > div:first-child');
        $this->iWait(1);
    }
}
