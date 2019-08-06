<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminProjectTrait
{
    /**
     * @When I go to the admin project list page
     */
    public function iGoToTheAdminProjectListPage()
    {
        $this->iVisitedPage('AdminProjectListPage');
    }

    /**
     * @When I go to the admin project type list page
     */
    public function iGoToTheAdminProjectTypeListPage()
    {
        $this->iVisitedPage('AdminProjectTypePage');
    }

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
     * @When I fill the authors field
     */
    public function iFillAuthorsField()
    {
        $node = $this->getCurrentPage()->find('css', '#project-author .react-select__input input');

        $node->setValue('admin');
        $node->keyPress(13);

        $this->getSession()->wait(10);
    }

    // TODO: Put each page in a different trait and add specific tests.

    /**
     * @When I go to the admin source list page
     */
    public function iGoToTheAdminSourceListPage()
    {
        $this->iVisitedPage('AdminProjectSourcePage');
    }

    /**
     * @When I go to the admin proposal list page
     */
    public function iGoToTheAdminProposalListPage()
    {
        $this->iVisitedPage('AdminProjectProposalPage');
    }

    /**
     * @When I go to the admin questionnaire list page
     */
    public function iGoToTheAdminQuestionnaireListPage()
    {
        $this->iVisitedPage('AdminProjectQuestionnairePage');
    }

    /**
     * @When I go to the admin appendix list page
     */
    public function iGoToTheAdminAppendixListPage()
    {
        $this->iVisitedPage('AdminProjectQuestionnairePage');
    }

    /**
     * @When I go to the admin consultation list page
     */
    public function iGoToTheAdminConsultationListPage()
    {
        $this->iVisitedPage('AdminProjectConsultationPage');
    }
    /**
     * @When I go to the admin consultation creation page
     */
    public function iGoToTheAdminConsultationCreationPage()
    {
        $this->iVisitedPage('AdminProjectConsultationCreationPage');
    }
}
