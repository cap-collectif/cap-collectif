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
}
