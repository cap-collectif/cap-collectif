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
     * @Then I save current admin content proposal
     */
    public function iClickTheProposalContentSaveButton()
    {
        $this->navigationContext->getPage('admin proposal page')->clickSaveContentProposalButton();
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
        $page->checkProposalCheckbox($elementName);
        $this->iWait(3);
    }

    /**
     * @When I change the proposal advancement select :select with option :value
     *
     * @param mixed $select
     * @param mixed $value
     */
    public function iChangeTheProposalAdvancementSelect($select, $value)
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
}
