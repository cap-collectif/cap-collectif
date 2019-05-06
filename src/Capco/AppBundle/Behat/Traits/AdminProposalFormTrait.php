<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminProposalFormTrait
{
    /**
     * @When I save current admin proposal form :tab
     *
     * @param mixed $tab
     */
    public function iSaveTheProposalForm(string $tab)
    {
        $this->getCurrentPage()->clickSaveProposalFormButton($tab);
    }

    /**
     * @When I toggle a proposal form button :elementName
     */
    public function iToggleAProposalFormButton(string $elementName)
    {
        $page = $this->getCurrentPage();
        $this->iWait(1);
        $page->clickOnButtonOrRadio($elementName);
        $this->iWait(3);
    }

    /**
     * @When I check a proposal form checkbox :elementName
     */
    public function iCheckAProposalFormCheckbox(string $elementName)
    {
        $page = $this->getCurrentPage();
        $page->clickOnButtonOrRadio('proposal form ' . $elementName);
        $this->iWait(1);
    }

    /**
     * @When I click on a proposal form button :elementName
     */
    public function iCheckAProposalFormButton(string $elementName)
    {
        $page = $this->getCurrentPage();
        $page->clickOnButtonOrRadio('proposal form ' . $elementName);
        $this->iWait(1);
    }

    /**
     * @When I change the proposal form select :select with option :value
     */
    public function iChangeTheProposalFormSelect(string $select, string $value)
    {
        $this->getCurrentPage()->selectProposalFormDropdown($value, $select);
        $this->iWait(1);
    }

    /**
     * @When I go to the admin proposal form :tab tab
     *
     * @param mixed $tab
     */
    public function iGoToTheAdminProposalFormTab(string $tab)
    {
        $page = $this->getCurrentPage();
        $this->iWait(3); // Wait alert to disappear
        $this->waitAndThrowOnFailure(3000, "$('" . $page->getSelector('proposal form ' . $tab . ' tab') . "').length > 0");
        $page->clickOnTab($tab);
        $this->iWait(1);
    }
}
