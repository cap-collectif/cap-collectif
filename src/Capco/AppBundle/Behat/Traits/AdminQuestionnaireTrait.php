<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminQuestionnaireTrait
{
    /**
     * @When I go to the admin questionnaire edit page with id :id
     */
    public function iGoToTheAdminQuestionnaireEditPage(string $id)
    {
        $this->visitPageWithParams('AdminProjectQuestionnairePage', ['questionnaireId' => $id]);
    }

    /**
     * @When I click on add questionnaire button
     */
    public function iClickOnAddQuestionnaireButton()
    {
        $this->getCurrentPage()->clickAddQuestionnaireButton();
    }
}
