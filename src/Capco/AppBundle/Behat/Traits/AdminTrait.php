<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Mink\Session;

trait AdminTrait
{
    use AdminProposalTrait;
    use AdminContactListTrait;
    use AdminProposalFormTrait;
    use AdminQuestionnaireTrait;
    use AdminUserTrait;
    use AdminProjectDistrictTrait;
    use AdminPageTrait;

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
        // Select the project "Dépot avec selection vote budget"
        $this->getSession()
            ->getPage()
            ->find('css', '#ProposalFusionForm-project .react-select__input input')
            ->setValue('UHJvamVjdDpwcm9qZWN0Nw==');
        $this->iWait(3);

        // Select 2 distinct proposals from the project
        $searchValues = [
            '', // Proposition gratuite
            'pas' // Proposition pas chère
        ];
        foreach ($searchValues as $search) {
            $this->getSession()
                ->getPage()
                ->find('css', '#ProposalFusionForm-fromProposals')
                ->click();
            $searchInput = $this->getSession()
                ->getPage()
                ->find('css', '#ProposalFusionForm-fromProposals .react-select__input input');
            $searchInput->setValue($search);
            $this->getSession()
                ->getPage()
                ->find('css', '#ProposalFusionForm-fromProposals')
                ->click();
            $this->iWait(3);
            $option = $this->getSession()
                ->getPage()
                ->find(
                    'css',
                    '#ProposalFusionForm-fromProposals .react-select__menu-list .react-select__option:first-child'
                );
            if ($option) {
                $option->click();
            } else {
                throw new \RuntimeException('Could not find option for search : "' . $search . '"');
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
        $this->iWait(3);
    }

    /**
     * @When I go to the admin proposal page with proposalid :proposalId
     */
    public function iGoToTheAdminProposalPageWithId(string $proposalId)
    {
        $this->visitPageWithParams('admin proposal page', ['proposalid' => $proposalId]);
        $this->waitAndThrowOnFailure(3000, "$('#proposal-admin-page-tabs').length > 0");
    }

    /**
     * @When I go to the admin proposal form page with id :id
     */
    public function iGoToTheAdminProposalFormPageWithId(string $id)
    {
        $this->visitPageWithParams('admin proposal form page', ['id' => $id]);
        $this->waitAndThrowOnFailure(3000, "$('#proposal-form-admin-page-tabs-tab-1').length > 0");
    }

    /**
     * @When I go to the admin user page with userId :userId
     */
    public function iGoToTheAdminUserPageWithId(string $userId)
    {
        $this->visitPageWithParams('admin user page', ['userId' => $userId]);
        $this->waitAndThrowOnFailure(5000, "$('#UserAdminPageTabs').length > 0");
    }

    /**
     * @When I go to the admin user list page
     */
    public function iGoToTheAdminUserListPage()
    {
        $this->visitPageWithParams('admin user list page');
        $this->waitAndThrowOnFailure(3000, "$('div#add-a-user').length > 0");
    }

    /**
     * @When I go to the admin group list page
     */
    public function iGoToTheAdminGroupListPage()
    {
        $this->visitPageWithParams('admin group list page');
        $this->waitAndThrowOnFailure(3000, "$('button#add-group').length > 0");
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

    /**
     * @Then I switch to window :tabIndex
     */
    public function iSwitchToWindow(int $tabIndex): void
    {
        /** @var Session $session */
        $session = $this->getSession();
        $windowNames = $session->getWindowNames();
        $session->switchToWindow($windowNames[$tabIndex]);
    }
}
