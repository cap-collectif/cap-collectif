<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Mink\Session;

trait AdminTrait
{
    use AdminContactListTrait;
    use AdminPageTrait;
    use AdminProjectDistrictTrait;
    use AdminProposalFormTrait;
    use AdminProposalTrait;
    use AdminQuestionnaireTrait;
    use AdminUserTrait;

    /**
     * @When I go to the admin proposals list page
     */
    public function iGoToTheAdminProposalsListPage()
    {
        $this->visitPageWithParams('admin proposal list page');
    }

    /**
     * @When I go to the admin authentification page
     */
    public function iGoToTheAdminAuthentificationPage()
    {
        $this->visitPageWithParams('admin proposal list page');
    }

    /**
     * @When I fill the :element react element with child number :number
     */
    public function iFillTheReactElementWithOneOption(string $element, int $number)
    {
        //Does not work if we do not try to enter something in the field
        $searchInput = $this->getSession()
            ->getPage()
            ->find('css', "{$element} .react-select__value-container .react-select__input input")
        ;
        $searchInput->focus();
        $this->iWait(3);
        $this->getSession()
            ->getPage()
            ->find('css', $element)
            ->click()
        ;
        $this->iWait(3);
        $this->getSession()
            ->getPage()
            ->find('css', "{$element}-menuList .react-select__option:nth-child({$number})")
            ->click()
        ;
    }

    /**
     * @When I should be redirected to a merge proposal
     */
    public function iShouldBeRedirectedToAMergeProposal()
    {
        $url = $this->getSession()->getCurrentUrl();
        if (1 !== preg_match('/^https:\/\/capco.test\/admin\/capco\/app\/proposal\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/edit$/i', $url)) {
            throw new \RuntimeException('The current url is not a merge proposal url');
        }
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
    }

    /**
     * @When I go to the admin proposal form list page
     */
    public function iGoToTheAdminProposalFormListPage()
    {
        $this->visit('/admin-next/proposalForm');
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
     * @When I go to the admin user invite page
     */
    public function iGoToTheAdminUserInvitePage()
    {
        $this->visitPageWithParams('admin user invite page');
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
     * @When I go to the admin user project :project page
     */
    public function iGoToTheAdminProjectPage(string $project)
    {
        $this->visitPageWithParams('admin project page', ['project' => $project]);
        $this->waitAndThrowOnFailure(3000, "$('#project-metadata-admin-form').length > 0");
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
     * @Then I click on button :selector
     */
    public function iClickOnButton(string $selector)
    {
        $this->iWaitElementToAppearOnPage($selector);
        $this->getCurrentPage()
            ->find('css', $selector)
            ->click()
        ;
    }

    /**
     * @When I duplicate a proposal form :proposalFormId
     */
    public function iDuplicateProposalForm(string $proposalFormId)
    {
        $this->visitPath("/admin/capco/app/proposalform/duplicate?id={$proposalFormId}");
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

    /**
     * @When I go to the admin section list page
     */
    public function iGoToTheAdminSectionListPage()
    {
        $this->visitPageWithParams('admin section list page');
        $this->waitAndThrowOnFailure(3000, "$('a.sonata-action-element').length > 0");
    }
}
