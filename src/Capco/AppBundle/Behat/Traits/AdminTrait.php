<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminTrait
{
    use AdminProposalTrait;
    use AdminProposalFormTrait;
    use AdminUserTrait;
    use AdminProjectDistrictTrait;

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
        $this->getSession()
            ->getPage()
            ->find('css', '#ProposalFusionForm-project .Select-input input')
            ->setValue('7');
        $this->iWait(3);
        // Select 2 distinct proposals from the project
        $proposals = ['', 'pas'];
        foreach ($proposals as $search) {
            $this->getSession()
                ->getPage()
                ->find('css', '#ProposalFusionForm-fromProposals')
                ->click();
            $searchInput = $this->getSession()
                ->getPage()
                ->find('css', '#ProposalFusionForm-fromProposals .Select-input input');
            $searchInput->setValue($search);
            $this->getSession()
                ->getPage()
                ->find('css', '#ProposalFusionForm-fromProposals')
                ->click();
            $this->iWait(3);
            $option = $this->getSession()
                ->getPage()
                ->find('css', '#ProposalFusionForm-fromProposals .Select-option[id*="-option-1"]');
            if ($option) {
                $option->click();
            }
            $this->iWait(2);
        }
        $this->getSession()
            ->getPage()
            ->find('css', '#ProposalFusionForm-fromProposals')
            ->click();
    }

    /**
     * @When I should be redirected to a merge proposal
     */
    public function iShouldBeRedirectedToAMergeProposal()
    {
        $url = $this->getSession()->getCurrentUrl();
        expect(
            preg_match(
                '/^https:\/\/capco.test\/admin\/capco\/app\/proposal\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/edit$/i',
                $url
            )
        )->toBe(1);
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
        $this->getSession()->wait(2000, "$('#main').length > 0");
    }

    /**
     * @When I go to the admin proposal form page with id :id
     */
    public function iGoToTheAdminProposalFormPageWithId(string $id)
    {
        $this->visitPageWithParams('admin proposal form page', ['id' => $id]);
        $this->getSession()->wait(2000, "$('#proposal-form-admin-page-tabs-tab-1').length > 0");
    }

    /**
     * @When I go to the admin user page with userId :userId
     */
    public function iGoToTheAdminUserPageWithId(string $userId)
    {
        $this->visitPageWithParams('admin user page', ['userId' => $userId]);
        $this->getSession()->wait(3000, "$('#user-admin-page-tabs').length > 0");
    }

    /**
     * @When I go to the admin user list page
     */
    public function iGoToTheAdminUserListPage()
    {
        $this->visitPageWithParams('admin user list page');
        $this->getSession()->wait(3000, "$('div#add-a-user').length > 0");
    }

    /**
     * @Then I click on button :id
     */
    public function iClickOnButton(string $id)
    {
        $this->getCurrentPage()
            ->find('css', $id)
            ->click();
    }

    /**
     * @When I duplicate a proposal form :proposalFormId
     */
    public function iDuplicateProposalForm(string $proposalFormId)
    {
        $this->visitPath("/admin/capco/app/proposalform/duplicate?id=${proposalFormId}");
    }
}
