<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class QuestionnairePage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/project/{projectSlug}/questionnaire/{stepSlug}';

    protected $elements = [
        'questionnaire form' => '#reply-form-container',
        'submit reply button' => '#CreateReplyForm-submit-create-reply',
        'submit draft button' => '#CreateReplyForm-submit-create-draft-reply',
        'submit update reply button' => '#UpdateReplyForm-UmVwbHk6cmVwbHky-submit-create-reply',
        'submit update draft button' =>
            '#UpdateReplyForm-UmVwbHk6cmVwbHk1-submit-create-draft-reply',
        'user replies' => '.userReplies',
        'user reply' => '.userReplies .replyLink',
        'user first reply link' => '.userReplies .reply:first-child a',
        'reply buttons' => '.reply__buttons',
        'delete reply button' => '.replyLink:last-child .btn-delete',
        'delete reply draft button' => '.replyLink:first-child .btn-delete',
        'delete 2nd reply draft button' => '.replyLink:first-child .btn-delete',
        'reply button link' => '.replyLink:last-child a',
        'reply draft button link' => '.replyLink:nth-child(2) a',
        'confirm delete reply button' => '#reply-confirm-delete-buttonUmVwbHk6cmVwbHky',
        'confirm delete last reply button' => '#reply-confirm-delete-buttonUmVwbHk6cmVwbHky',
        'confirm delete reply draft button' => '#reply-confirm-delete-buttonUmVwbHk6cmVwbHk5',
        'confirm delete 2nd reply draft button' => '#reply-confirm-delete-buttonUmVwbHk6cmVwbHk1',
        'first ranking choice button pick' =>
            '#ranking__choices [data-rbd-draggable-id="UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UxMg=="] .btn-pick-item',
        'update first ranking choice button pick' =>
            '[data-rbd-draggable-id="UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UxMg=="] .btn-pick-item',
        'update second ranking choice button pick' =>
            '[data-rbd-draggable-id="UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UxMw=="] .btn-pick-item',
        'button answer again' => '.btn-answer-again',
        'first checkbox' =>
            '[for=CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux]',
        'second checkbox' =>
            '[for=CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uy]',
        'third checkbox' =>
            '[for=CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uz]',
    ];

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        if (!$this->getSession()->wait(5000, "$('.questionnaire-page').length > 0")) {
            throw new \RuntimeException(
                'Proposal page did not fully load, check selector in "verifyPage".'
            );
        }
    }

    public function submitReply()
    {
        $this->getElement('submit reply button')->click();
    }

    public function submitDraft()
    {
        $this->getElement('submit draft button')->click();
    }

    public function submitUpdatedReply()
    {
        $this->getElement('submit update reply button')->click();
    }

    public function submitUpdatedDraft()
    {
        $this->getElement('submit update draft button')->click();
    }

    public function clickButtonToAnswerAgain()
    {
        $this->getElement('button answer again')->click();
    }

    public function clickFirstRankingChoiceButtonPick()
    {
        $this->getElement('first ranking choice button pick')->click();
    }

    public function clickFirstRankingChoiceButtonPickUpdate()
    {
        $this->getElement('update first ranking choice button pick')->click();
    }

    public function clickSecondRankingChoiceButtonPickUpdate()
    {
        $this->getElement('update second ranking choice button pick')->click();
    }

    public function getSubmitReplyButtonSelector()
    {
        return $this->getSelector('submit reply button');
    }

    public function submitEditedReply()
    {
        $this->getElement('submit edited reply button')->click();
    }

    public function clickEditReplyButton()
    {
        $this->getElement('edit reply button')->click();
    }

    public function getReplyButtonsSelector()
    {
        return $this->getSelector('reply buttons');
    }

    public function getDeleteReplyButtonSelector()
    {
        return $this->getSelector('delete reply button');
    }

    public function clickReplyButtonLink()
    {
        $this->getElement('reply button link')->click();
    }

    public function clickReplyDraftButtonLink()
    {
        $this->getElement('reply draft button link')->click();
    }

    public function clickDeleteReplyButton()
    {
        $this->getElement('delete reply button')->click();
    }

    public function clickDeleteReplyDraftButton()
    {
        $this->getElement('delete reply draft button')->click();
    }

    public function clickDelete2ndReplyDraftButton()
    {
        $this->getElement('delete 2nd reply draft button')->click();
    }

    public function clickConfirmDeleteReplyDraftButton()
    {
        $this->getElement('confirm delete reply draft button')->click();
    }

    public function clickConfirmDelete2ndReplyDraftButton()
    {
        $this->getElement('confirm delete 2nd reply draft button')->click();
    }

    public function clickConfirmDeleteReplyButton()
    {
        $this->getElement('confirm delete reply button')->click();
    }

    public function clickConfirmDeleteLastReplyButton()
    {
        $this->getElement('confirm delete last reply button')->click();
    }

    public function getSelectorForUserReply()
    {
        return $this->getSelector('user reply');
    }

    public function clickFirstUserReply()
    {
        $this->getElement('user first reply link')->click();
    }
}
