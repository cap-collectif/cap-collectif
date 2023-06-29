<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Mink\Element\NodeElement;
use PHPUnit\Framework\Assert;

trait QuestionnaireStepsTrait
{
    protected static $questionnaireStepParams = [
        'projectSlug' => 'projet-avec-questionnaire',
        'stepSlug' => 'questionnaire-des-jo-2024/',
    ];
    protected static $conditionalQuestionnaireStepParams = [
        'projectSlug' => 'projet-avec-questionnaire',
        'stepSlug' => 'etape-de-questionnaire-avec-questionnaire-sauts-conditionnels/',
    ];
    protected static $questionnaireStepClosedParams = [
        'projectSlug' => 'projet-avec-questionnaire',
        'stepSlug' => 'etape-de-questionnaire-fermee',
    ];
    protected static $questionnaireStepWithNoMultipleReplies = [
        'projectSlug' => 'projet-avec-questionnaire',
        'stepSlug' => 'questionnaire/',
    ];
    protected static $replyLink = [
        'projectSlug' => 'projet-avec-questionnaire',
        'stepSlug' => 'questionnaire-des-jo-2024/',
        'replyId' => 'UmVwbHk6cmVwbHky',
    ];
    protected static $replyDraftLink = [
        'projectSlug' => 'projet-avec-questionnaire',
        'stepSlug' => 'questionnaire-des-jo-2024/',
        'replyId' => 'UmVwbHk6cmVwbHk5',
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
     * @When I go to a conditional questionnaire step
     */
    public function iGoToAConditionalQuestionnaireStep()
    {
        $this->visitPageWithParams('questionnaire page', self::$conditionalQuestionnaireStepParams);
        $this->iWaitElementToAppearOnPage('.questionnaire-page', 2000);
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
        $this->iWaitElementToAppearOnPage('#CreateReplyForm-responses0');
        $this->scrollToElement('#CreateReplyForm-responses0');
        $this->checkElement(
            'CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux'
        );
        $this->scrollToElement(
            '#CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux'
        );

        $this->checkElement(
            'CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uy'
        );
        $this->iWait(1);
    }

    /**
     * @When I fill the questionnaire form without the required questions
     */
    public function iFillTheQuestionnaireFormWithoutTheRequiredQuestions()
    {
        $this->fillField('CreateReplyForm-responses0', '');
        $this->selectOptionFromReact(
            '#CreateReplyForm-responses3',
            'Pas assez fort (Mon sonotone est en panne)'
        );
    }

    /**
     * @When I update the draft form without the required questions
     */
    public function iUpdateTheQuestionnaireFormWithoutTheRequiredQuestions()
    {
        $this->scrollToElement('#UpdateReplyForm-UmVwbHk6cmVwbHk1-responses0');
        $this->fillField(
            'UpdateReplyForm-UmVwbHk6cmVwbHk1-responses0',
            'This biscuit bless your soul'
        );
        $this->checkElement(
            'UpdateReplyForm-UmVwbHk6cmVwbHk1-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux'
        );
    }

    /**
     * @When I fill the questionnaire form with not enough choices for required question
     */
    public function iFillTheQuestionnaireFormWithNotEnoughChoicesForRequiredQuestion()
    {
        $this->iWaitElementToAppearOnPage('#CreateReplyForm-responses0');
        $this->fillField(
            'CreateReplyForm-responses0',
            'Je pense que c\'est la ville parfaite pour organiser les JO'
        );
        $this->checkElement(
            'CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux'
        );
        $this->scrollToElement(
            '#CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux'
        );

        $this->checkElement(
            'CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uz'
        );
    }

    /**
     * @When I fill the questionnaire form with not enough choices for optional question
     */
    public function iFillTheQuestionnaireFormWithNotEnoughChoicesForOptionalQuestion()
    {
        $this->fillQuestionnaireForm();
        $this->iClickOneRankingChoiceButtonPick();
    }

    /**
     * @When I check the reply private checkbox
     */
    public function iCheckTheReplyPrivateCheckbox()
    {
        $this->checkElement('CreateReplyForm-reply-private');
    }

    /**
     * @Then I click on answer again
     */
    public function iClickOnAnswerAgain()
    {
        $this->iWaitElementToAppearOnPage('.btn-answer-again');
        $this->scrollToElement('.btn-answer-again');
        $this->navigationContext->getPage('questionnaire page')->clickButtonToAnswerAgain();
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
        $qlEditors = $this->getSession()
            ->getPage()
            ->findAll('css', '.ql-editor.ql-blank');
        /** @var NodeElement $qlEditor */
        foreach ($qlEditors as $qlEditor) {
            if ($qlEditor->hasAttribute('contenteditable')) {
                Assert::assertEquals('false', $qlEditor->getAttribute('contenteditable'));
            }
        }
        $inputs = $this->getSession()
            ->getPage()
            ->findAll('css', 'input');
        foreach ($inputs as $input) {
            if ($input->hasAttribute('data-video')) {
                continue;
            }
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
     * @Then I should see :nb replies
     */
    public function iShouldSeeMyNbReply(int $nb = 2)
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext
            ->getPage('questionnaire page')
            ->getSelectorForUserReply();
        $this->waitAndThrowOnFailure(10000, "$('" . $userReplySelector . "').length == " . $nb);
    }

    /**
     * @Then I should see my reply private
     */
    public function iShouldSeeMyAnonymousReply()
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext
            ->getPage('questionnaire page')
            ->getSelectorForUserReply();
        $this->waitAndThrowOnFailure(10000, "$('" . $userReplySelector . "').length === 2");
        $this->assertElementContainsText($userReplySelector, 'reply.private');
    }

    /**
     * @When I should only see my reply and not questionnaire
     */
    public function iShouldSeeMyReplyAndNotQuestionnaire()
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext
            ->getPage('questionnaire page')
            ->getSelectorForUserReply();
        $this->waitAndThrowOnFailure(3000, "$('" . $userReplySelector . "').length === 1");
        $this->waitAndThrowOnFailure(3000, "$('#reply-form-container').length === 0");
    }

    /**
     * @Then I should not see my reply anymore
     */
    public function iShouldNotSeeMyReplyAnymore()
    {
        $userReplySelector = $this->navigationContext
            ->getPage('questionnaire page')
            ->getSelectorForUserReply();
        $this->waitAndThrowOnFailure(3000, "$('" . $userReplySelector . "').length == 0");
    }

    /**
     * @Then I click one ranking choice button pick
     */
    public function iClickOneRankingChoiceButtonPick()
    {
        $this->scrollToElement('#CreateReplyForm-responses4');
        $this->navigationContext
            ->getPage('questionnaire page')
            ->clickFirstRankingChoiceButtonPick();
    }

    public function iClickOnRankingChoicesButtonPickUpdate()
    {
        $this->scrollToElement('#UpdateReplyForm-UmVwbHk6cmVwbHky-responses4');
        $this->navigationContext
            ->getPage('questionnaire page')
            ->clickFirstRankingChoiceButtonPickUpdate();
        $this->navigationContext
            ->getPage('questionnaire page')
            ->clickSecondRankingChoiceButtonPickUpdate();
    }

    /**
     * @Then the ranking choice should be in the choice box
     */
    public function theRankingChoiceShouldBeInTheChoiceBox()
    {
        $this->assertElementContainsText(
            '#ranking__selection [data-rbd-draggable-id="UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UxMg=="]',
            'Choix 1'
        );
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
        $this->scrollToElement('#UpdateReplyForm-UmVwbHk6cmVwbHky-responses2');
        $this->fillField(
            'UpdateReplyForm-UmVwbHk6cmVwbHky-responses2',
            'I am not the right answer you are looking for'
        );
    }

    /**
     * @When I update the draft form with wrong values
     */
    public function iUpdateTheDraftFormWithWrongValues()
    {
        $this->scrollToElement('#UpdateReplyForm-UmVwbHk6cmVwbHk1-responses2');
        $this->fillField(
            'UpdateReplyForm-UmVwbHk6cmVwbHk1-responses2',
            'I am not the right answer you are looking for'
        );
    }

    /**
     * @Then I click on the reply button link
     */
    public function iClickOnReplyButtonLink()
    {
        $this->navigationContext->getPage('questionnaire page')->clickReplyButtonLink();
    }

    /**
     * @Then I click on reply draft button link
     */
    public function iClickOnTheUpdateReplyDraftButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickReplyDraftButtonLink();
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
     * @Then I confirm last reply deletion
     */
    public function iConfirmLastReplyDeletion()
    {
        $this->navigationContext
            ->getPage('questionnaire page')
            ->clickConfirmDeleteLastReplyButton();
    }

    /**
     * @Then I click the delete reply draft button
     */
    public function iClickDeleteReplyDraftButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickDeleteReplyDraftButton();
    }

    /**
     * @Then I click the delete 2nd reply draft button
     */
    public function iClickDelete2ndReplyDraftButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickDelete2ndReplyDraftButton();
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
     * @Then I confirm 2nd reply draft deletion
     */
    public function iConfirm2ndReplyDraftDeletion()
    {
        $this->navigationContext
            ->getPage('questionnaire page')
            ->clickConfirmDelete2ndReplyDraftButton();
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
                'CreateReplyForm-responses0',
                'Je pense que c\'est la ville parfaite pour organiser les JO'
            );

            $this->iCheckEnoughRequiredCustomCheckbox();

            return;
        }

        $this->fillField(
            'CreateReplyForm-responses0',
            'En fait c\'est nul, je ne veux pas des JO à Paris'
        );
    }

    protected function fillQuestionnaireFormWithInteger()
    {
        $page = $this->navigationContext->getPage('questionnaire page');
        $this->waitAndThrowOnFailure(
            5000,
            "$('" . $page->getSelector('questionnaire form') . "').length > 0"
        );
        $this->iShouldSeeElementOnPage('questionnaire form', 'questionnaire page');
        $this->fillField('CreateReplyForm-responses0', '99876');
        $this->iCheckEnoughRequiredCustomCheckbox();
    }

    protected function fillUpdateQuestionnaireForm()
    {
        $this->fillField(
            'UpdateReplyForm-UmVwbHk6cmVwbHky-responses0',
            'Je pense que c\'est la ville parfaite pour organiser les JO'
        );

        $this->iClickOnRankingChoicesButtonPickUpdate();
    }

    protected function iCheckEnoughRequiredCustomCheckbox()
    {
        $this->checkElement(
            'CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux'
        );
        $this->scrollToElement(
            '#CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux'
        );

        $this->checkElement(
            'CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uy'
        );
        $this->checkElement(
            'CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uz'
        );
    }
}
