<?php

namespace Capco\AppBundle\Behat\Traits;

use PHPUnit\Framework\Assert;

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
     * @When I go to a questionnaire step
     */
    public function iGoToAQuestionnaireStep()
    {
        $this->visitPageWithParams('questionnaire page', self::$questionnaireStepParams);
        $this->iWait(1);
    }

    /**
     * @When I go to a closed questionnaire step
     */
    public function iGoToAClosedQuestionnaireStep()
    {
        $this->visitPageWithParams('questionnaire page', self::$questionnaireStepClosedParams);
        $this->iWait(1);
    }

    /**
     * @When I go to a questionnaire step with no multiple replies allowed
     */
    public function iGoToAQuestionnaireStepWithNoMultipleRepliesAllowed()
    {
        $this->visitPageWithParams(
            'questionnaire page',
            self::$questionnaireStepWithNoMultipleReplies
        );
        $this->iWait(1);
    }

    /**
     * @When I go to a questionnaire step with no edition allowed
     */
    public function iGoToAQuestionnaireStepWithNoEditionAllowed()
    {
        $this->visitPageWithParams(
            'questionnaire page',
            self::$questionnaireStepWithNoMultipleReplies
        );
        $this->iWait(1);
    }

    // ************************************************** Creation ***********************************************************

    /**
     * @When I fill the questionnaire form
     */
    public function iFillTheQuestionnaireForm()
    {
        $this->fillQuestionnaireForm();
    }

    /**
     * @When I fill the questionnaire form with integers in single input text
     */
    public function iFillTheQuestionnaireWithIntegerInSingleInputTextForm()
    {
        $this->fillQuestionnaireFormWithInteger();
    }

    /**
     * @When I fill the questionnaire form with wrong values
     */
    public function iFillTheQuestionnaireFormWithWrongValues()
    {
        $this->scrollToElement('CreateReplyForm-responses[0]');
        $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice1');
        $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice2');
    }

    /**
     * @When I fill the questionnaire form without the required questions
     */
    public function iFillTheQuestionnaireFormWithoutTheRequiredQuestions()
    {
        $this->fillField('CreateReplyForm-responses[0]', '');
        $this->selectOption(
            'CreateReplyForm-responses[3]',
            'Pas assez fort (Mon sonotone est en panne)'
        );
    }

    /**
     * @When I update the draft form without the required questions
     */
    public function iUpdateTheQuestionnaireFormWithoutTheRequiredQuestions()
    {
        $this->fillField('UpdateReplyForm-reply5-responses[0]', 'This biscuit bless your soul');
        $this->checkOption('UpdateReplyForm-reply5-responses[1]_choice-questionchoice3');
    }

    /**
     * @When I fill the questionnaire form with not enough choices for required question
     */
    public function iFillTheQuestionnaireFormWithNotEnoughChoicesForRequiredQuestion()
    {
        $this->fillField(
            'CreateReplyForm-responses[0]',
            'Je pense que c\'est la ville parfaite pour organiser les JO'
        );
        $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice1');
        $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice3');
    }

    /**
     * @When I fill the questionnaire form with not enough choices for optional question
     */
    public function iFillTheQuestionnaireFormWithNotEnoughChoicesForOptionalQuestion()
    {
        $this->fillQuestionnaireForm();
        $this->iClickOneRankingChoiceRightArrow();
    }

    /**
     * @When I check the reply private checkbox
     */
    public function iCheckTheReplyPrivateCheckbox()
    {
        $this->checkOption('CreateReplyForm-reply-private');
    }

    /**
     * @When I submit my reply
     */
    public function iSubmitMyReply()
    {
        $this->navigationContext->getPage('questionnaire page')->submitReply();
    }

    /**
     * @When I submit my draft
     */
    public function iSubmitMyDraft()
    {
        $this->navigationContext->getPage('questionnaire page')->submitDraft();
    }

    /**
     * @When I submit my updated reply
     */
    public function iSubmitMyUpdatedReply()
    {
        $this->navigationContext->getPage('questionnaire page')->submitUpdatedReply();
    }

    /**
     * @When I submit my updated draft
     */
    public function iSubmitMyUpdatedDraft()
    {
        $this->navigationContext->getPage('questionnaire page')->submitUpdatedDraft();
    }

    /**
     * @Then the questionnaire form should be disabled
     */
    public function theQuestionnaireFormShouldBeDisabled()
    {
        $inputs = $this->getSession()
            ->getPage()
            ->findAll('css', 'input');
        foreach ($inputs as $input) {
            Assert::assertTrue($input->hasAttribute('disabled'));
        }
        $textareas = $this->getSession()
            ->getPage()
            ->findAll('css', 'textarea');
        foreach ($textareas as $textarea) {
            Assert::assertTrue($textarea->hasAttribute('disabled'));
        }
        $this->theElementHasAttribute(
            $this->getCurrentPage()->getSubmitReplyButtonSelector(),
            'disabled'
        );
    }

    /**
     * @Then I should see my reply
     */
    public function iShouldSeeMyReply()
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext
            ->getPage('questionnaire page')
            ->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(1, $userReplySelector);
    }

    /**
     * @Then I should see my anonymous reply
     */
    public function iShouldSeeMyAnonymousReply()
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext
            ->getPage('questionnaire page')
            ->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(1, $userReplySelector);
        $this->iWait(3);
        $this->assertElementContainsText($userReplySelector, 'reply.private');
    }

    /**
     * @Then I should not see my reply anymore
     */
    public function iShouldNotSeeMyReplyAnymore()
    {
        $userReplySelector = $this->navigationContext
            ->getPage('questionnaire page')
            ->getSelectorForUserReply();
        $this->waitAndThrowOnFailure(2000, "$('" . $userReplySelector . "').length == 0");

        $this->iShouldSeeNbElementOnPage(0, $userReplySelector);
    }

    /**
     * @Then I click one ranking choice right arrow
     */
    public function iClickOneRankingChoiceRightArrow()
    {
        $this->scrollToElement('CreateReplyForm-responses[4]');
        $this->navigationContext
            ->getPage('questionnaire page')
            ->clickFirstRankingChoiceRightArrow();
    }

    public function iClickOneRankingChoiceRightArrowUpdate()
    {
        $this->scrollToElement('UpdateReplyForm-reply2-responses[4]');
        $this->navigationContext
            ->getPage('questionnaire page')
            ->clickFirstRankingChoiceRightArrowUpdate();
        $this->iWait(1);
    }

    /**
     * @Then the ranking choice should be in the choice box
     */
    public function theRankingChoiceShouldBeInTheChoiceBox()
    {
        $this->assertElementContainsText('.ranking__choice-box__choices', '1. Choix');
    }

    // ************************************************* Update *************************************************

    /**
     * @When I update the questionnaire form
     */
    public function iUpdateTheQuestionnaireForm()
    {
        $this->fillUpdateQuestionnaireForm();
    }

    /**
     * @When I update the questionnaire form with wrong values
     */
    public function iUpdateTheQuestionnaireFormWithWrongValues()
    {
        $this->scrollToElement('UpdateReplyForm-reply2-responses[2]');
        $this->fillField(
            'UpdateReplyForm-reply2-responses[2]',
            'I am not the right answer you are looking for'
        );
    }

    /**
     * @When I update the draft form with wrong values
     */
    public function iUpdateTheDraftFormWithWrongValues()
    {
        $this->scrollToElement('UpdateReplyForm-reply5-responses[2]');
        $this->fillField(
            'UpdateReplyForm-reply5-responses[2]',
            'I am not the right answer you are looking for'
        );
    }

    /**
     * @Then I click on the update reply button
     */
    public function iClickOnTheUpdateReplyButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickUpdateReplyButton();
    }

    /**
     * @Then I click on the update reply draft button
     */
    public function iClickOnTheUpdateReplyDraftButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickUpdateReplyDraftButton();
    }

    // ************************************************* Deletion *************************************************

    /**
     * @Then I click the delete reply button
     */
    public function iClickTheDeleteReplyButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickDeleteReplyButton();
    }

    /**
     * @Then I confirm reply deletion
     */
    public function iConfirmReplyDeletion()
    {
        $this->navigationContext->getPage('questionnaire page')->clickConfirmDeleteReplyButton();
    }

    /**
     * @Then I click the delete reply draft button
     */
    public function iClickDeleteReplyDraftButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickDeleteReplyDraftButton();
    }

    /**
     * @Then I confirm reply draft deletion
     */
    public function iConfirmReplyDraftDeletion()
    {
        $this->navigationContext
            ->getPage('questionnaire page')
            ->clickConfirmDeleteReplyDraftButton();
    }

    /**
     * @Then I should not see the delete reply button
     */
    public function iShouldNotSeeTheDeleteReplyButton()
    {
        $deleteButtonSelector = $this->navigationContext
            ->getPage('questionnaire page')
            ->getDeleteReplyButtonSelector();
        $this->assertElementNotOnPage($deleteButtonSelector);
    }

    /**
     * @When I click on my first reply
     */
    public function iClickOnMyFirstReply()
    {
        $this->navigationContext->getPage('questionnaire page')->clickFirstUserReply();
    }

    /**
     * @Then I should see my first reply
     */
    public function iShouldSeeMyFirstReply()
    {
        $replyModalSelector = $this->navigationContext
            ->getPage('questionnaire page')
            ->getReplyModalSelector();
        $this->assertElementOnPage($replyModalSelector);
        $this->assertElementContainsText($replyModalSelector, 'reply.show.link');
    }

    protected function fillQuestionnaireForm($edition = false)
    {
        $page = $this->navigationContext->getPage('questionnaire page');
        $this->waitAndThrowOnFailure(
            2000,
            "$('" . $page->getSelector('questionnaire form') . "').length > 0"
        );
        $this->iShouldSeeElementOnPage('questionnaire form', 'questionnaire page');
        if (!$edition) {
            $this->fillField(
                'CreateReplyForm-responses[0]',
                'Je pense que c\'est la ville parfaite pour organiser les JO'
            );
            $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice1');
            $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice2');
            $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice3');

            return;
        }
        $this->fillField(
            'CreateReplyForm-responses[0]',
            'En fait c\'est nul, je ne veux pas des JO à Paris'
        );
    }

    protected function fillQuestionnaireFormWithInteger()
    {
        $page = $this->navigationContext->getPage('questionnaire page');
        $this->waitAndThrowOnFailure(
            2000,
            "$('" . $page->getSelector('questionnaire form') . "').length > 0"
        );
        $this->iShouldSeeElementOnPage('questionnaire form', 'questionnaire page');
        $this->fillField('CreateReplyForm-responses[0]', '99876');
        $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice1');
        $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice2');
        $this->checkOption('CreateReplyForm-responses[1]_choice-questionchoice3');
    }

    protected function fillUpdateQuestionnaireForm()
    {
        $this->iShouldSeeElementOnPage('user reply modal', 'questionnaire page');
        $this->fillField(
            'UpdateReplyForm-reply2-responses[0]',
            'Je pense que c\'est la ville parfaite pour organiser les JO'
        );
        $this->checkOption('UpdateReplyForm-reply2-responses[1]_choice-questionchoice1');

        $this->iClickOneRankingChoiceRightArrowUpdate();
        $this->iClickOneRankingChoiceRightArrowUpdate();
    }
}
