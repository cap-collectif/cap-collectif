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
     * @When I fill :analyst1 and :analyst2 to the analyst select
     */
    public function iFillProposalEvaluationAnalysts(string $analyst1, string $analyst2)
    {
        $this->iWait(2);
        $this->getCurrentPage()
            ->find('css', '#evaluers .react-select__input input')
            ->setValue($analyst1)
        ;
        $this->iWait(3);
        $this->getCurrentPage()
            ->find('css', '#evaluers')
            ->click()
        ;
        $this->getCurrentPage()
            ->find('css', '#evaluers .react-select__option:first-child')
            ->click()
        ;
        $this->iWait(3);
        $this->getCurrentPage()
            ->find('css', '#evaluers .react-select__input input')
            ->setValue($analyst2)
        ;
        $this->iWait(2);
        $this->getCurrentPage()
            ->find('css', '#evaluers')
            ->click()
        ;
        $this->iWait(2);
        $this->getCurrentPage()
            ->find('css', '#evaluers .react-select__option:first-child')
            ->click()
        ;
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
     */
    public function iFillTheProposalElementWithValue(string $element, string $value)
    {
        $this->getCurrentPage()->fillElementWithValue($element, $value);
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
            ->click()
        ;
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
            ->click()
        ;
    }
}
