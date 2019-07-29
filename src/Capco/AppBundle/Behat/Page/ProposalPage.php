<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ProposalPage extends Page
{
    use PageTrait;

    protected $path = '/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}';

    protected $elements = [
        'proposal votes counter' => '#proposal-page-tabs-tab-votes .badge',
        'proposal comments counter' => '#proposal-page-comments-counter',
        'comments list' => '.proposal__comments',
        'first vote' => '.proposal__vote:nth-child(1)',
        'first follower' => '.proposal__follower:nth-child(1)',
        'last follower' => '.proposal__follower:last-child ',
        'proposal vote button' => '#proposal-vote-btn',
        'proposal follow button' => '#proposal-follow-btn',
        'proposal unfollow button' => '#proposal-unfollow-btn',
        'proposal vote form submit button' => '#confirm-proposal-vote',
        'edit proposal button' => '#proposal-edit-button',
        'delete proposal button' => '#proposal-delete-button',
        'confirm delete proposal button' => '#confirm-proposal-delete',
        'confirm edit proposal button' => '#confirm-proposal-edit',
        'report proposal button' => '.proposal__btn--report',
        'comment button' => 'button.btn--comment',
        'proposal buttons' => '.proposal__content .proposal__buttons',
        'share button' => '#proposal-share-button',
        'votes tab' => '#proposal-page-tabs-tab-votes',
        'followers tab' => '#proposal-page-tabs-tab-followers',
        'comments tab' => '#proposal-page-tabs-tab-comments',
        'proposal follow minimal' => '#proposal-follow-btn-minimal',
        'proposal follow essential' => '#proposal-follow-btn-essential',
        'proposal follow all' => '#proposal-follow-btn-all'
    ];

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        if (!$this->getSession()->wait(5000, "$('#ProposalPageContent').length > 0")) {
            throw new \RuntimeException(
                'Proposal page did not fully load, check selector in "verifyPage".'
            );
        }
    }

    public function getDeleteButtonSelector()
    {
        return $this->getSelector('delete proposal button');
    }

    public function getUpdateButtonSelector()
    {
        return $this->getSelector('edit proposal button');
    }

    public function getVoteButtonSelector($id)
    {
        return $this->getSelector('proposal vote form submit button');
    }

    public function getCommentButton()
    {
        return $this->getElement('comment button');
    }

    public function getVotesCounter()
    {
        return $this->getElement('proposal votes counter');
    }

    public function getVotesCount(): int
    {
        return (int) filter_var($this->getVotesCounter()->getText(), FILTER_SANITIZE_NUMBER_INT);
    }

    public function getCommentsCounter()
    {
        return $this->getElement('proposal comments counter');
    }

    public function getCommentsCount(): int
    {
        return (int) filter_var($this->getCommentsCounter()->getText(), FILTER_SANITIZE_NUMBER_INT);
    }

    public function getCommentsListSelector()
    {
        return $this->getSelector('comments list');
    }

    public function getFirstVoteSelector()
    {
        return $this->getSelector('first vote');
    }

    public function getFirstSelector($selector)
    {
        return $this->getSelector("first ${selector}");
    }

    public function getLastSelector($selector)
    {
        return $this->getSelector("last ${selector}");
    }

    public function getVoteButton()
    {
        return $this->getElement('proposal vote button');
    }

    public function clickVoteButton()
    {
        $button = $this->getVoteButton();
        $button->click();
    }

    public function submitCommentForm()
    {
        $button = $this->getCommentButton();
        $button->click();
    }

    public function getVoteButtonLabel()
    {
        return $this->getVoteButton()->getText();
    }

    public function submitProposalVoteForm()
    {
        $this->getElement('proposal vote form submit button')->click();
    }

    public function clickEditProposalButton()
    {
        $this->getElement('edit proposal button')->click();
    }

    public function clickDeleteProposalButton()
    {
        $this->getElement('delete proposal button')->click();
    }

    public function clickConfirmDeleteProposalButton()
    {
        $this->getElement('confirm delete proposal button')->click();
    }

    public function clickReportProposalButton()
    {
        $this->getElement('report proposal button')->click();
    }

    public function clickEditCommentButton(string $id)
    {
        $this->find('css', "[id='CommentEdit-${id}']")->click();
    }

    public function getProposalButtonsSelector()
    {
        return $this->getSelector('proposal buttons');
    }

    public function submitEditProposalForm()
    {
        $this->getElement('confirm edit proposal button')->click();
    }

    public function clickShareButton()
    {
        $this->getElement('share button')->click();
    }

    public function clickVotesTab()
    {
        $this->getElement('votes tab')->click();
    }

    public function clickFollowersTab()
    {
        $this->getElement('followers tab')->click();
    }

    public function clickCommentsTab()
    {
        $this->getElement('comments tab')->click();
    }

    public function followMinimalIsChecked(string $proposalId)
    {
        $element = $this->elements['proposal follow minimal'] . "-${proposalId}";

        return $this->find('css', $element)->isChecked();
    }

    public function followEssentialIsChecked(string $proposalId)
    {
        $element = $this->elements['proposal follow essential'] . "-${proposalId}";

        return $this->find('css', $element)->isChecked();
    }

    public function followAllIsChecked(string $proposalId)
    {
        $element = $this->elements['proposal follow all'] . "-${proposalId}";

        return $this->find('css', $element)->isChecked();
    }

    public function clickFollowChoice(string $choice, $proposalId)
    {
        $element = $this->elements[$choice] . "-${proposalId}";

        return $this->find('css', $element)->click();
    }

    public function clickFollowButton(string $proposalId)
    {
        $element = $this->elements['proposal follow button'] . "-${proposalId}";

        return $this->find('css', $element)->click();
    }

    public function clickUnfollowButton(string $proposalId)
    {
        $element = $this->elements['proposal unfollow button'] . "-${proposalId}";

        return $this->find('css', $element)->click();
    }
}
