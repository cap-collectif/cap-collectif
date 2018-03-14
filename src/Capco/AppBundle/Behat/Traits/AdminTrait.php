<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminTrait
{
    use AdminProposalTrait;
    use AdminProposalFormTrait;

    /**
     * @When I go to the admin proposals list page
     */
    public function iGoToTheAdminProposalsListPage()
    {
        $this->visitPageWithParams('admin proposal list page');
    }

    /**
     * @When I click the create merge button
     */
    public function iClickTheMergeButton()
    {
        $this->getCurrentPage()->clickCreateProposalMergeButton();
    }

    /**
     * @When I fill the proposal merge form
     */
    public function iFillTheProposalMergeForm()
    {
        // Select a project
        $this->getSession()->getPage()->find('css', '#project .Select-input input')->setValue('7');
        $this->iWait(3);
        // Select 2 distinct proposals from the project
        $proposals = ['', 'pas'];
        foreach ($proposals as $search) {
            $this->getSession()->getPage()->find('css', '#fromProposals')->click();
            $searchInput = $this->getSession()->getPage()->find('css', '#fromProposals .Select-input input');
            $searchInput->setValue($search);
            $this->getSession()->getPage()->find('css', '#fromProposals')->click();
            $this->iWait(3);
            $option = $this->getSession()->getPage()->find('css', '#fromProposals .Select-option');
            if ($option) {
                $option->click();
            }
            $this->iWait(2);
        }
        $this->getSession()->getPage()->find('css', '#fromProposals')->click();
    }

    /**
     * @When I should be redirected to a merge proposal
     */
    public function iShouldBeRedirectedToAMergeProposal()
    {
        $url = $this->getSession()->getCurrentUrl();
        expect(preg_match('/^http:\/\/capco.test\/admin\/capco\/app\/proposal\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/edit$/i', $url))->toBe(1);
    }

    /**
     * @When I submit the create merge form
     */
    public function iSubmitTheCreateMergeForm()
    {
        $this->getCurrentPage()->clickSubmitProposalMergeButton();
    }

    /**
     * @When I go to the admin proposal page with proposalid :proposalid
     */
    public function iGoToTheAdminProposalPageWithId(string $proposalid)
    {
        $this->visitPageWithParams('admin proposal page', ['proposalid' => $proposalid]);
    }

    /**
     * @When I go to the admin proposal form page with proposalformpageid :proposalformpageid
     */
    public function iGoToTheAdminProposalFormPageWithId(string $proposalformpageid)
    {
        $this->visitPageWithParams('admin proposal form page', ['proposalformpageid' => $proposalformpageid]);
    }
}
