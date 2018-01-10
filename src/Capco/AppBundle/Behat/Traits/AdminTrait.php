<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminTrait
{
    use AdminProposalTrait;

    /**
     * @When I go to the admin proposals pages
     */
    public function iGoToTheAdminProposalsPages()
    {
        $this->visitPageWithParams('admin proposal pages');
    }

    /**
     * @When I click the create merge button
     */
    public function iClickTheMergeButton()
    {
        $this->navigationContext->getPage('admin proposal pages')->clickCreateProposalMergeButton();
    }

    /**
     * @When I fill the proposal merge form
     */
    public function iFillTheProposalMergeForm()
    {
        $this->iWait(2);
        $this->getSession()->getPage()->find('css', '#project .Select-input input')->setValue('7');
        $this->iWait(3);
        $this->getSession()->getPage()->find('css', '#childConnections')->click();
        $this->getSession()->getPage()->find('css', '#childConnections .Select-option[id*="-option-1"]')->click();
        $this->iWait(3);
        $this->getSession()->getPage()->find('css', '#childConnections .Select-input input')->setValue('chère');
        $this->iWait(2);
        $this->getSession()->getPage()->find('css', '#childConnections')->click();
        $this->iWait(2);
        $this->getSession()->getPage()->find('css', '#childConnections .Select-option[id*="-option-1"]')->click();
        $this->fillField('title', 'test');
        $this->fillField('proposal-admin-body', 'Description');
    }

    /**
     * @When I submit the create merge form
     */
    public function iSubmitTheCreateMergeForm()
    {
        $this->navigationContext->getPage('admin proposal pages')->clickSubmitProposalMergeButton();
    }

    /**
     * @When I go to the admin proposal page with proposalid :proposalid
     */
    public function iGoToTheAdminProposalPageWithId(string $proposalid)
    {
        $this->visitPageWithParams('admin proposal page', ['proposalid' => $proposalid]);
    }
}
