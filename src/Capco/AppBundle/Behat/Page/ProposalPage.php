<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ProposalPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}';

    protected $elements = [
        'proposal votes counter' => '.proposal__info--votes .value',
        'proposal comments counter' => '.proposal__info--comments .value',
        'comments list' => '.proposal__comments',
        'first vote' => '.proposal__vote:nth-child(1)',
        'proposal vote form submit button' => '#confirm-proposal-vote',
        'edit proposal button' => '#proposal-edit-button',
        'delete proposal button' => '#proposal-delete-button',
        'confirm delete proposal button' => '#confirm-proposal-delete',
        'confirm edit proposal button' => '#confirm-proposal-edit',
        'report proposal button' => '#proposal-report-button',
        'proposal buttons' => '.proposal__content .proposal__buttons',
        'share button' => '#proposal-share-button',
    ];

    public function getVoteButtonSelector($id)
    {
        return $this->getSelector('proposal vote form submit button');
    }

    public function getVoteButton($id)
    {
        return $this->getElement('proposal vote form submit button');
    }

    public function getVotesCounter()
    {
        return $this->getElement('proposal votes counter');
    }

    public function getVotesCount()
    {
        return intval($this->getVotesCounter()->getText());
    }

    public function getCommentsCounter()
    {
        return $this->getElement('proposal comments counter');
    }

    public function getCommentsCount()
    {
        return intval($this->getCommentsCounter()->getText());
    }

    public function getCommentsListSelector()
    {
        return $this->getSelector('comments list');
    }

    public function getFirstVoteSelector()
    {
        return $this->getSelector('first vote');
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
}
