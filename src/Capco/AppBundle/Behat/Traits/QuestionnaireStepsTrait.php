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
        $this->selectOption('reply-12', 'Pas assez fort (Mon sonotone est en panne)');
    }

    /**
     * I fill the questionnaire form with not enough choices for required question.
     *
     * @When I fill the questionnaire form with not enough choices for required question
     */
    public function iFillTheQuestionnaireFormWithNotEnoughChoicesForRequiredQuestion()
    {
        $this->fillField('reply-2', 'Je pense que c\'est la ville parfaite pour organiser les JO');
        $this->checkOption('reply-10_choice-questionchoice1');
        $this->checkOption('reply-10_choice-questionchoice3');
    }

    /**
     * I fill the questionnaire form with not enough choices for optional question.
     *
     * @When I fill the questionnaire form with not enough choices for optional question
     */
    public function iFillTheQuestionnaireFormWithNotEnoughChoicesForOptionalQuestion()
    {
        $this->fillQuestionnaireForm();
        $this->iClickOneRankingChoiceRightArrow();
    }

    /**
     * I check the reply private checkbox.
     *
     * @When I check the reply private checkbox
     */
    public function iCheckTheReplyPrivateCheckbox()
    {
        $this->checkOption('reply-private');
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
     * I should see my reply.
     *
     * @Then I should see my reply
     */
    public function iShouldSeeMyReply()
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext->getPage('questionnaire page')->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(1, $userReplySelector);
        $this->assertElementNotContainsText($userReplySelector, '(anonyme)');
    }

    /**
     * I should see my anonymous reply.
     *
     * @Then I should see my anonymous reply
     */
    public function iShouldSeeMyAnonymousReply()
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext->getPage('questionnaire page')->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(1, $userReplySelector);
        $this->assertElementContainsText($userReplySelector, '(anonyme)');
    }

    /**
     * @Then I should not see my reply anymore
     */
    public function iShouldNotSeeMyReplyAnymore()
    {
        $userReplySelector = $this->navigationContext->getPage('questionnaire page')->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(0, $userReplySelector);
    }

    /**
     * I click one ranking choice right arrow.
     *
     * @Then I click one ranking choice right arrow
     */
    public function iClickOneRankingChoiceRightArrow()
    {
        $this->navigationContext->getPage('questionnaire page')->clickFirstRankingChoiceRightArrow();
        $this->iWait(1);
    }

    /**
     * The ranking choice should be in the choice box.
     *
     * @Then the ranking choice should be in the choice box
     */
    public function theRankingChoiceShouldBeInTheChoiceBox()
    {
        $this->assertElementContainsText('.ranking__choice-box__choices', '1. Choix');
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
        $this->fillQuestionnaireForm(false);
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
        $deleteButtonSelector = $this->navigationContext->getPage('questionnaire page')->getDeleteReplyButtonSelector();
        $this->assertElementNotOnPage($deleteButtonSelector);
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

    protected function fillQuestionnaireForm($edition = false)
    {
        $this->iShouldSeeElementOnPage('questionnaire form', 'questionnaire page');
        if (!$edition) {
            $this->fillField('reply-2', 'Je pense que c\'est la ville parfaite pour organiser les JO');
            $this->checkOption('reply-10_choice-questionchoice1');
            $this->checkOption('reply-10_choice-questionchoice2');
            $this->checkOption('reply-10_choice-questionchoice3');
        } else {
            $this->fillField('reply-2', 'En fait c\'est nul, je ne veux pas des JO à Paris');
        }
    }
}
