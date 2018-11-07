<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminProposalTrait
{
    /**
     * @When I change the proposals :selectName with option :option
     */
    public function iChangeTheProposalsSelect(string $selectName, string $option)
    {
        $this->selectOption($selectName, $option);
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
     * @When I go to the admin proposal :tab tab
     *
     * @param mixed $tab
     */
    public function iGoToTheAdminProposalTab($tab)
    {
        $page = $this->getCurrentPage();
        $this->iWait(3); // Wait alert to disappear
        $this->getSession()->wait(
            3000,
            "$('" . $page->getSelector('proposal ' . $tab . ' tab') . "').length > 0"
        );
        $page->clickOnTab("proposal $tab");
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
    public function iChangeTheProposalAdvancementSelect(string $select, string $value)
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
        $this->getSession()->wait(3000, "$('#proposal_address').length > 0");
        $this->fillField('proposal_address', $address);
        $this->getSession()->wait(
            3000,
            "$('#PlacesAutocomplete__autocomplete-container > div:first-child').length > 0"
        );
        $this->iClickElement('#PlacesAutocomplete__autocomplete-container > div:first-child');
        $this->iWait(1);
    }

    /**
     * @When I fill :analyst1 and :analyst2 to the analyst select
     */
    public function iFillProposalEvaluationAnalysts(string $analyst1, string $analyst2)
    {
        $this->iWait(2);
        $this->getCurrentPage()
            ->find('css', '#evaluers .Select-input input')
            ->setValue($analyst1);
        $this->iWait(3);
        $this->getCurrentPage()
            ->find('css', '#evaluers')
            ->click();
        $this->getCurrentPage()
            ->find('css', '#evaluers .Select-option:nth-child(1)')
            ->click();
        $this->iWait(3);
        $this->getCurrentPage()
            ->find('css', '#evaluers .Select-input input')
            ->setValue($analyst2);
        $this->iWait(2);
        $this->getCurrentPage()
            ->find('css', '#evaluers')
            ->click();
        $this->iWait(2);
        $this->getCurrentPage()
            ->find('css', '#evaluers .Select-option:nth-child(1)')
            ->click();
    }

    /**
     * @When I save the current proposal evaluation analysts groupes
     */
    public function iSaveTheProposalEvaluationAnalystGroupes()
    {
        $this->getCurrentPage()->clickSaveProposalEvaluationAnalystsGroupes();
    }

    /**
     * @When I evaluate the proposal presentation to :value
     */
    public function iEvaluateTheProposalPresentationTo(string $value)
    {
        $this->getCurrentPage()->evaluateProposalPresentation($value);
    }

    /**
     * @When I fill the proposal element :element with value :value
     **/
    public function iFillTheProposalElementWithValue(string $element, string $value)
    {
        $this->getCurrentPage()->fillElementWithValue($element, $value);
    }

    /**
     * @When I check :value in the proposal definition evaluation
     */
    public function iCheckTheProposalDefinitionEvaluationWithValue(string $value)
    {
        $element =
            '#proposal-admin-page-tabs-pane-5 div[id="proposal-admin-evaluation-responses[3]"] div.checkbox input[type="checkbox"][name="choices-for-field-proposal-admin-evaluation-responses[3]"][value="' .
            $value .
            '"]';
        $this->getCurrentPage()
            ->find('css', $element)
            ->check();
    }

    /**
     * @When I check :value in the proposal definition resume
     */
    public function iCheckTheProposalResumeEvaluationWithValue(string $value)
    {
        $element =
            '#proposal-admin-page-tabs-pane-5 div.radio input[type="radio"][value="' .
            $value .
            '"]';
        $this->getCurrentPage()
            ->find('css', $element)
            ->click();
    }

    /**
     * @When I save the custom evaluation
     */
    public function iSaveTheCustomProposalEvaluation()
    {
        $this->getCurrentPage()->saveCustomEvaluation();
    }

    /**
     * @When I click on :status status
     */
    public function iClickOnProposalStatus(string $status)
    {
        $element =
            '#proposal-admin-page-tabs-pane-6 input[type="radio"][name="publicationStatus"][value="' .
            $status .
            '"]+span';
        $this->getCurrentPage()
            ->find('css', $element)
            ->click();
        $this->iWait(1);
    }

    /**
     * @When I save the proposal's status
     */
    public function iSaveTheProposalStatus()
    {
        $element =
            '#proposal-admin-page-tabs-pane-6 button[type="submit"][class="btn btn-primary"]';
        $this->getCurrentPage()
            ->find('css', $element)
            ->click();
    }

    /**
     * @When I delete the proposal
     */
    public function iDeleteTheProposal()
    {
        $element = '#proposal-admin-page-tabs-pane-6 button[type="button"][class="btn btn-danger"]';
        $this->getCurrentPage()
            ->find('css', $element)
            ->click();
    }

    /**
     * @When I confirm the admin proposal deletion
     */
    public function iConfirmAdminProposalDeletion()
    {
        $this->getSession()
            ->getDriver()
            ->getWebDriverSession()
            ->accept_alert();
    }

    /**
     * @When I should see status :status
     */
    public function iShouldSeeTheProposalStatus(string $status)
    {
        $element =
            '#proposal-admin-page-tabs-pane-6 input[type="radio"][name="publicationStatus"][value="' .
            $status .
            '"]+span';
        $this->getCurrentPage()->find('css', $element);
    }
}
