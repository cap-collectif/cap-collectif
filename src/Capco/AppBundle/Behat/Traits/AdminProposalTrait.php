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
     * @When I go to the admin proposal evaluation tab
     */
    public function iGoToTheAdminProposalEvaluerTab()
    {
        $page = $this->getCurrentPage();
        $this->iWait(3); // Wait alert to disappear
        $this->getSession()->wait(3000, "$('" . $page->getSelector('proposal evaluation tab') . "').length > 0");
        $page->clickEvaluationTab();
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

    /**
     * @When I fill :analyst1 and :analyst2 to the analyst select
     */
    public function iFillProposalEvaluationAnalysts(string $analyst1, string $analyst2)
    {
        $this->iWait(2);
        $this->getCurrentPage()->find('css', '#evaluers .Select-input input')->setValue($analyst1);
        $this->iWait(3);
        $this->getCurrentPage()->find('css', '#evaluers')->click();
        $this->getCurrentPage()->find('css', '#evaluers .Select-option[id*="-option-1"]')->click();
        $this->iWait(3);
        $this->getCurrentPage()->find('css', '#evaluers .Select-input input')->setValue($analyst2);
        $this->iWait(2);
        $this->getCurrentPage()->find('css', '#evaluers')->click();
        $this->iWait(2);
        $this->getCurrentPage()->find('css', '#evaluers .Select-option[id*="-option-1"]')->click();
    }

    /**
     * @When I save the current proposal evaluation analysts groupes
     */
    public function iSaveTheProposalEvaluationAnalystGroupes()
    {
        $this->getCurrentPage()->clickSaveProposalEvaluationAnalystsGroupes();
    }
}
