<?php

namespace Capco\AppBundle\Behat\Traits;

trait QuestionnaireStepsTrait
{
    protected static $questionnaireStepParams = [
        'projectSlug' => 'projet-avec-questionnaire',
        'stepSlug' => 'questionnaire-des-jo-2024',
    ];
    protected static $questionnaireStepClosedParams = [
        'projectSlug' => 'projet-avec-questionnaire',
        'stepSlug' => 'etape-de-questionnaire-fermee',
    ];
    protected static $questionnaireStepWithNoMultipleReplies = [
        'projectSlug' => 'projet-avec-questionnaire',
        'stepSlug' => 'questionnaire',
    ];

    /**
     * Go to a questionnaire step page.
     *
     * @When I go to a questionnaire step
     */
    public function iGoToAQuestionnaireStep()
    {
        $this->visitPageWithParams('questionnaire page', self::$questionnaireStepParams);
    }

    /**
     * Go to a closed questionnaire step page.
     *
     * @When I go to a closed questionnaire step
     */
    public function iGoToAClosedQuestionnaireStep()
    {
        $this->visitPageWithParams('questionnaire page', self::$questionnaireStepClosedParams);
    }

    /**
     * Go to a questionnaire step with no multiple replies allowed page.
     *
     * @When I go to a questionnaire step with no multiple replies allowed
     */
    public function iGoToAQuestionnaireStepWithNoMultipleRepliesAllowed()
    {
        $this->visitPageWithParams('questionnaire page', self::$questionnaireStepWithNoMultipleReplies);
    }

    /**
     * Go to a questionnaire step with no edition allowed.
     *
     * @When I go to a questionnaire step with no edition allowed
     */
    public function iGoToAQuestionnaireStepWithNoEditionAllowed()
    {
        $this->visitPageWithParams('questionnaire page', self::$questionnaireStepWithNoMultipleReplies);
    }

    // ************************************************** Creation ***********************************************************

    /**
     * I fill the questionnaire form.
     *
     * @When I fill the questionnaire form
     */
    public function iFillTheQuestionnaireForm()
    {
        $this->fillQuestionnaireForm();
    }

    /**
     * I fill the questionnaire form without the required questions.
     *
     * @When I fill the questionnaire form without the required questions
     */
    public function iFillTheQuestionnaireFormWithoutTheRequiredQuestions()
    {
        $this->selectOption('reply-8', 'Pas assez fort (Mon sonotone est en panne)');
    }

    protected function fillQuestionnaireForm($edition = false)
    {
        $this->iShouldSeeElementOnPage('questionnaire form', 'questionnaire page');
        if (!$edition) {
            $this->fillField('reply-2', 'Je pense que c\'est la ville parfaite pour organiser les JO');
            $this->checkOption('reply-6_choice-1');
            $this->checkOption('reply-6_choice-3');
        } else {
            $this->fillField('reply-2', 'En fait c\'est nul, je ne veux pas des JO à Paris');
        }
    }

    /**
     * I submit my reply.
     *
     * @When I submit my reply
     */
    public function iSubmitMyReply()
    {
        $this->navigationContext->getPage('questionnaire page')->submitReply();
        $this->iWait(5);
    }

    /**
     * The questionnaire form should be disabled.
     *
     * @Then the questionnaire form should be disabled
     */
    public function theQuestionnaireFormShouldBeDisabled()
    {
        $inputs = $this->getSession()->getPage()->findAll('css', 'input');
        foreach ($inputs as $input) {
            \PHPUnit_Framework_TestCase::assertTrue($input->hasAttribute('disabled'));
        }
        $textareas = $this->getSession()->getPage()->findAll('css', 'textarea');
        foreach ($textareas as $textarea) {
            \PHPUnit_Framework_TestCase::assertTrue($textarea->hasAttribute('disabled'));
        }
        $this->elementHasAttribute($this->getCurrentPage()->getSubmitReplyButtonSelector(), 'disabled');
    }

    /**
     * I should see my replies.
     *
     * @Then I should see my replies
     */
    public function iShouldSeeMyReplies()
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext->getPage('questionnaire page')->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(1, $userReplySelector);
    }

    /**
     * I should not see my reply anymore.
     *
     * @Then I should not see my reply anymore
     */
    public function iShouldNotSeeMyReplyAnymore()
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext->getPage('questionnaire page')->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(0, $userReplySelector);
    }

    // *************************************************************** Edition *********************************************************************

    /**
     * I click the edit reply button.
     *
     * @Then I click the edit reply button
     */
    public function iClickTheEditReplyButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickEditReplyButton();
        $this->iWait(1);
    }

    /**
     * I edit my reply.
     *
     * @When I edit my reply
     */
    public function iEditMyReply()
    {
        $this->fillQuestionnaireForm(false, true);
    }

    /**
     * I submit my edited reply.
     *
     * @When I submit my edited reply
     */
    public function iSubmitMyEditedReply()
    {
        $this->navigationContext->getPage('questionnaire page')->submitEditedReply();
        $this->iWait(5);
    }

    /**
     * I should not see the edit reply button.
     *
     * @Then I should not see the edit reply button
     */
    public function iShouldNotSeeTheEditReplyButton()
    {
        $replyButtonsSelector = $this->navigationContext->getPage('questionnaire page')->getReplyButtonsSelector();
        $this->assertElementNotContainsText($replyButtonsSelector, 'Modifier');
    }

    // ************************************************* Deletion *************************************************

    /**
     * I click the delete reply button.
     *
     * @Then I click the delete reply button
     */
    public function iClickTheDeleteReplyButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickDeleteReplyButton();
        $this->iWait(1);
    }

    /**
     * I confirm reply deletion.
     *
     * @Then I confirm reply deletion
     */
    public function iConfirmReplyDeletion()
    {
        $this->navigationContext->getPage('questionnaire page')->clickConfirmDeleteReplyButton();
        $this->iWait(3);
    }

    /**
     * I should not see the delete reply button.
     *
     * @Then I should not see the delete reply button
     */
    public function iShouldNotSeeTheDeleteReplyButton()
    {
        $replyButtonsSelector = $this->navigationContext->getPage('questionnaire page')->getReplyButtonsSelector();
        $this->assertElementNotContainsText($replyButtonsSelector, 'Supprimer');
    }

    /**
     * I click on my first reply.
     *
     * @When I click on my first reply
     */
    public function iClickOnMyFirstReply()
    {
        $this->navigationContext->getPage('questionnaire page')->clickFirstUserReply();
        $this->iWait(1);
    }

    /**
     * I should see my first reply.
     *
     * @Then I should see my first reply
     */
    public function iShouldSeeMyFirstReply()
    {
        $replyModalSelector = $this->navigationContext->getPage('questionnaire page')->getReplyModalSelector();
        $this->assertElementOnPage($replyModalSelector);
        $this->assertElementContainsText($replyModalSelector, 'Réponse du');
    }
}
