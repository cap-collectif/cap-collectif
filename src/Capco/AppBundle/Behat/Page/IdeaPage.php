<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class IdeaPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/ideas/{slug}';

    protected $elements = [
        'First comment vote button' => '.opinion--comment button.btn',
        'First comment vote counter' => '.opinion--comment .opinion__votes-nb',
        'idea edit button' => '#idea-edit-button',
        'idea votes counter' => '#idea-votes-nb',
        'idea comments counter' => '#idea-comments-nb',
        'idea edit confirm checkbox' => '#idea-form #idea_confirm',
        'idea edit form submit button' => '#confirm-idea-edit',
        'idea delete button' => '#idea-delete-button',
        'idea confirm deletion button' => '#confirm-idea-delete',
        'idea report button' => '.idea__btn--report',
        'idea vote button' => '#idea-vote-button',
        'comments list' => '.idea__comments',
        'first vote' => '.idea__vote:nth-child(1)',
        'share button' => '#idea-share-button',
    ];

    public function voteForFirstComment()
    {
        $this->getElement('First comment vote button')->click();
    }

    public function getFirstCommentVoteCounter()
    {
        return $this->getElement('First comment vote counter')->getText();
    }

    public function clickIdeaEditButton()
    {
        $this->getElement('idea edit button')->click();
    }

    public function getVotesCounter()
    {
        return $this->getElement('idea votes counter');
    }

    public function getVotesCount(): int
    {
        return (int) filter_var($this->getVotesCounter()->getText(), FILTER_SANITIZE_NUMBER_INT);
    }

    public function getCommentsCounter()
    {
        return $this->getElement('idea comments counter');
    }

    public function getCommentsCount(): int
    {
        return (int) ($this->getCommentsCounter()->getText());
    }

    public function checkIdeaConfirmCheckbox()
    {
        $this->getElement('idea edit confirm checkbox')->check();
    }

    public function submitIdeaEditForm()
    {
        $this->getElement('idea edit form submit button')->click();
    }

    public function clickIdeaReportButton()
    {
        $this->getElement('idea report button')->click();
    }

    public function clickIdeaDeleteButton()
    {
        $this->getElement('idea delete button')->click();
    }

    public function clickIdeaConfirmDeletionButton()
    {
        $this->getElement('idea confirm deletion button')->click();
    }

    public function getVoteButton()
    {
        return $this->getElement('idea vote button');
    }

    public function getVoteButtonSelector()
    {
        return $this->getSelector('idea vote button');
    }

    public function clickVoteButton()
    {
        $this->getVoteButton()->click();
    }

    public function getVoteButtonLabel()
    {
        return $this->getVoteButton()->getText();
    }

    public function getCommentsListSelector()
    {
        return $this->getSelector('comments list');
    }

    public function getFirstVoteSelector()
    {
        return $this->getSelector('first vote');
    }

    public function clickShareButton()
    {
        $this->getElement('share button')->click();
    }
}
