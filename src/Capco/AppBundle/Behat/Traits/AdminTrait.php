<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Mink\Session;

trait AdminTrait
{
    use AdminGlobalDistrictTrait;
    use AdminProposalFormTrait;
    use AdminProposalTrait;
    use AdminQuestionnaireTrait;
    use AdminUserTrait;

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
     * @When I go to the admin proposal page with proposalid :proposalId
     */
    public function iGoToTheAdminProposalPageWithId(string $proposalId)
    {
        $this->visitPageWithParams('admin proposal page', ['proposalid' => $proposalId]);
        $this->waitAndThrowOnFailure(10000, "$('#proposal-admin-page-tabs').length > 0");
    }

    /**
     * @When I go to the admin proposal form page with id :id
     */
    public function iGoToTheAdminProposalFormPageWithId(string $id)
    {
        $this->visitPageWithParams('admin proposal form page', ['id' => $id]);
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
