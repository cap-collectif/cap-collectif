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
    }

    /**
     * @When I go to a closed questionnaire step
     */
    public function iGoToAClosedQuestionnaireStep()
    {
        $this->visitPageWithParams('questionnaire page', self::$questionnaireStepClosedParams);
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
     * @When I fill the questionnaire form without the required questions
     */
    public function iFillTheQuestionnaireFormWithoutTheRequiredQuestions()
    {
        $this->fillField('CreateReplyForm-responses[1]', '');
        $this->selectOption(
            'CreateReplyForm-responses[5]',
            'Pas assez fort (Mon sonotone est en panne)'
        );
    }

    /**
     * @When I fill the questionnaire form with not enough choices for required question
     */
    public function iFillTheQuestionnaireFormWithNotEnoughChoicesForRequiredQuestion()
    {
        $this->fillField(
            'CreateReplyForm-responses[1]',
            'Je pense que c\'est la ville parfaite pour organiser les JO'
        );
        $this->checkOption('CreateReplyForm-responses[3]_choice-questionchoice1');
        $this->checkOption('CreateReplyForm-responses[3]_choice-questionchoice3');
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
        $this->iWait(5);
    }

    /**
     * @When I submit my updated reply
     */
    public function iSubmitMyUpdatedReply()
    {
        $this->navigationContext->getPage('questionnaire page')->submitUpdatedReply();
        $this->iWait(5);
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
        $userReplySelector = $this->navigationContext->getPage(
            'questionnaire page'
        )->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(1, $userReplySelector);
        $this->assertElementNotContainsText($userReplySelector, 'reply.private');
    }

    /**
     * @Then I should see my anonymous reply
     */
    public function iShouldSeeMyAnonymousReply()
    {
        $this->iShouldSeeElementOnPage('user replies', 'questionnaire page');
        $userReplySelector = $this->navigationContext->getPage(
            'questionnaire page'
        )->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(1, $userReplySelector);
        $this->assertElementContainsText($userReplySelector, 'reply.private');
    }

    /**
     * @Then I should not see my reply anymore
     */
    public function iShouldNotSeeMyReplyAnymore()
    {
        $userReplySelector = $this->navigationContext->getPage(
            'questionnaire page'
        )->getSelectorForUserReply();
        $this->iShouldSeeNbElementOnPage(0, $userReplySelector);
    }

    /**
     * @Then I click one ranking choice right arrow
     */
    public function iClickOneRankingChoiceRightArrow()
    {
        $this->navigationContext->getPage(
            'questionnaire page'
        )->clickFirstRankingChoiceRightArrow();
        $this->iWait(1);
    }

    public function iClickOneRankingChoiceRightArrowUpdate()
    {
        $this->navigationContext->getPage(
            'questionnaire page'
        )->clickFirstRankingChoiceRightArrowUpdate();
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
     * @Then I click on the update reply button
     */
    public function iClickOnTheUpdateReplyButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickUpdateReplyButton();
        $this->iWait(1);
    }

    // ************************************************* Deletion *************************************************

    /**
     * @Then I click the delete reply button
     */
    public function iClickTheDeleteReplyButton()
    {
        $this->navigationContext->getPage('questionnaire page')->clickDeleteReplyButton();
        $this->iWait(1);
    }

    /**
     * @Then I confirm reply deletion
     */
    public function iConfirmReplyDeletion()
    {
        $this->navigationContext->getPage('questionnaire page')->clickConfirmDeleteReplyButton();
        $this->iWait(3);
    }

    /**
     * @Then I should not see the delete reply button
     */
    public function iShouldNotSeeTheDeleteReplyButton()
    {
        $deleteButtonSelector = $this->navigationContext->getPage(
            'questionnaire page'
        )->getDeleteReplyButtonSelector();
        $this->assertElementNotOnPage($deleteButtonSelector);
    }

    /**
     * @When I click on my first reply
     */
    public function iClickOnMyFirstReply()
    {
        $this->navigationContext->getPage('questionnaire page')->clickFirstUserReply();
        $this->iWait(1);
    }

    /**
     * @Then I should see my first reply
     */
    public function iShouldSeeMyFirstReply()
    {
        $replyModalSelector = $this->navigationContext->getPage(
            'questionnaire page'
        )->getReplyModalSelector();
        $this->assertElementOnPage($replyModalSelector);
        $this->assertElementContainsText($replyModalSelector, 'reply.show.link');
    }

    protected function fillQuestionnaireForm($edition = false)
    {
        $this->iShouldSeeElementOnPage('questionnaire form', 'questionnaire page');
        if (!$edition) {
            $this->fillField(
                'CreateReplyForm-responses[1]',
                'Je pense que c\'est la ville parfaite pour organiser les JO'
            );
            $this->checkOption('CreateReplyForm-responses[3]_choice-questionchoice1');
            $this->checkOption('CreateReplyForm-responses[3]_choice-questionchoice2');
            $this->checkOption('CreateReplyForm-responses[3]_choice-questionchoice3');

            return;
        }
        $this->fillField(
            'CreateReplyForm-responses[1]',
            'En fait c\'est nul, je ne veux pas des JO à Paris'
        );
    }

    protected function fillUpdateQuestionnaireForm()
    {
        $this->iShouldSeeElementOnPage('user reply modal', 'questionnaire page');
        $this->fillField(
            'UpdateReplyForm-reply2-responses[1]',
            'En fait c\'est nul, je ne veux pas des JO à Paris'
        );
        $this->fillField(
            'UpdateReplyForm-reply2-responses[1]',
            'Je pense que c\'est la ville parfaite pour organiser les JO'
        );
        $this->checkOption('UpdateReplyForm-reply2-responses[3]_choice-questionchoice1');

        $this->iClickOneRankingChoiceRightArrowUpdate();
    }
}
