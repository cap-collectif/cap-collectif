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
        'questionnaire form' => '#create-reply-form',
        'submit reply button' => '#CreateReplyForm-submit-create-reply',
        'submit draft button' => '#CreateReplyForm-submit-create-draft-reply',
        'submit update reply button' => '#UpdateReplyForm-UmVwbHk6cmVwbHky-submit-create-reply',
        'submit update draft button' =>
            '#UpdateReplyForm-UmVwbHk6cmVwbHk1-submit-create-draft-reply',
        'user replies' => '#user-replies',
        'user reply' => '#user-replies .reply',
        'user reply modal' => '.reply__modal--show',
        'user first reply link' => '#user-replies .reply:first-child',
        'reply buttons' => '.reply__buttons',
        'delete reply button' => '#reply-link-UmVwbHk6cmVwbHky .reply__delete-btn',
        'delete reply draft button' => '#reply-link-UmVwbHk6cmVwbHk1 .reply__delete-btn',
        'update reply button' => '#reply-link-UmVwbHk6cmVwbHky .reply__update-btn',
        'update reply draft button' => '#reply-link-UmVwbHk6cmVwbHk1 .reply__update-btn',
        'confirm delete reply button' => '#reply-confirm-delete-buttonUmVwbHk6cmVwbHky',
        'confirm delete reply draft button' => '#reply-confirm-delete-buttonUmVwbHk6cmVwbHk1',
        'first ranking choice right arrow' =>
            '.ranking__pick-box__choices .ranking__spot:first-child .ranking__item__arrow--right',
        'update first ranking choice right arrow' =>
            '.reply__modal--show .ranking__pick-box__choices .ranking__spot:first-child .ranking__item__arrow--right',
    ];

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

    public function clickFirstRankingChoiceRightArrow()
    {
        $this->getElement('first ranking choice right arrow')->click();
    }

    public function clickFirstRankingChoiceRightArrowUpdate()
    {
        $this->getElement('update first ranking choice right arrow')->click();
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

    public function clickUpdateReplyButton()
    {
        $this->getElement('update reply button')->click();
    }

    public function clickUpdateReplyDraftButton()
    {
        $this->getElement('update reply draft button')->click();
    }

    public function clickDeleteReplyButton()
    {
        $this->getElement('delete reply button')->click();
    }

    public function clickDeleteReplyDraftButton()
    {
        $this->getElement('delete reply draft button')->click();
    }

    public function clickConfirmDeleteReplyDraftButton()
    {
        $this->getElement('confirm delete reply draft button')->click();
    }

    public function clickConfirmDeleteReplyButton()
    {
        $this->getElement('confirm delete reply button')->click();
    }

    public function getSelectorForUserReply()
    {
        return $this->getSelector('user reply');
    }

    public function clickFirstUserReply()
    {
        $this->getElement('user first reply link')->click();
    }

    public function getReplyModalSelector()
    {
        return $this->getSelector('user reply modal');
    }
}
