<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminProjectTrait
{
    /**
     * @When I click the project add button
     */
    public function iClickAddProjectButton()
    {
        $this->getCurrentPage()->clickAddButton();
    }

    /**
     * @When I submit the project add modal
     */
    public function iSubmitProjectModal()
    {
        $this->getCurrentPage()->submitModal();
    }

    /**
     * @When I go to the admin questionnaire list page
     */
    public function iGoToTheAdminQuestionnaireListPage()
    {
        $this->iVisitedPage('AdminProjectQuestionnairePage');
    }

    /**
     * @When I fill the project authors field with name :username
     */
    public function iFillProjectAuthorsFieldWithName(string $username)
    {
        /** @var DocumentElement $page */
        $page = $this->getCurrentPage();
        $page->find('css', '#project-author .react-select__input input')->setValue($username);
        $this->iWait(3);
        $page->find('css', '#project-author')->click();
        $page->find('css', '.react-select__menu-portal .react-select__option:first-child')->click();
    }
}
