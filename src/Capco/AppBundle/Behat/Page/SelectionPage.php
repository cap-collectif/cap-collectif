<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\UnexpectedPageException;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class SelectionPage extends Page
{
    use PageTrait;

    protected $path = '/project/{projectSlug}/selection/{stepSlug}';

    protected $elements = [
        'proposal preview 2' => '#proposal-2',
        'proposal votes counter 2' => '#proposal-2 .proposal__counter--votes .proposal__counter__value',
        'proposal vote button 2' => 'button#proposal-vote-btn-2',
        'proposal comments counter 2' => '#proposal-2 .proposal__counter--comments .proposal__counter__value',
        'proposal preview 10' => '#proposal-10',
        'proposal votes counter 10' => '#proposal-10 .proposal__counter--votes .proposal__counter__value',
        'proposal vote button 10' => 'button#proposal-vote-btn-10',
        'proposal comments counter 10' => '#proposal-10 .proposal__counter--comments .proposal__counter__value',
        'proposal preview 11' => '#proposal-11',
        'proposal votes counter 11' => '#proposal-11 .proposal__counter--votes .proposal__counter__value',
        'proposal vote button 11' => 'button#proposal-vote-btn-11',
        'proposal comments counter 11' => '#proposal-11 .proposal__counter--comments .proposal__counter__value',
        'proposal preview 8' => '#proposal-8',
        'proposal votes counter 8' => '#proposal-8 .proposal__counter--votes .proposal__counter__value',
        'proposal vote button 8' => 'button#proposal-vote-btn-8',
        'proposal comments counter 8' => '#proposal-8 .proposal__counter--comments .proposal__counter__value',
        'proposal' => '.proposal__preview',
        'proposal vote button to hover' => '#proposal-vote-btn-1',
        'sorting select' => 'select#proposal-sorting',
        'selected sorting option' => '#proposal-sorting option[selected]',
        'proposal vote form submit button' => '#confirm-proposal-vote',
        'proposal vote button 18' => 'button#proposal-vote-btn-18',
        'proposal vote button 17' => 'button#proposal-vote-btn-17',
    ];

    public function sortByDate()
    {
        $this->getElement('sorting select')->selectOption('Les plus récentes');
    }

    public function sortByComments()
    {
        $this->getElement('sorting select')->selectOption('Les plus commentées');
    }

    public function getSelectedSortingOption()
    {
        return $this->getElement('sorting select')->getValue();
    }

    public function getProposalSelector(): string
    {
        return $this->getSelector('proposal');
    }

    public function getVoteButton(int $id)
    {
        return $this->getElement('proposal vote button ' . $id);
    }

    public function getVoteButtonSelector(int $id = 2): string
    {
        return $this->getSelector('proposal vote button ' . $id);
    }

    public function clickVoteButton(int $id = 2)
    {
        $button = $this->getVoteButton($id);
        try {
            $button->getParent()->getParent()->getParent()->getParent()->mouseOver();
            $button->click();
        } catch (\Exception $e) {
            $button->getParent()->getParent()->getParent()->click();
        }
    }

    public function getVoteButtonLabel(int $id = 2)
    {
        return $this->getVoteButton($id)->getText();
    }

    public function getVotesCounter(int $id)
    {
        return $this->getElement('proposal votes counter ' . $id);
    }

    public function getVotesCount(int $id = 2)
    {
        return (int) $this->getVotesCounter($id)->getText();
    }

    public function getCommentsCounter(int $id)
    {
        return $this->getElement('proposal comments counter ' . $id);
    }

    public function getCommentsCount(int $id = 2)
    {
        return (int) $this->getCommentsCounter($id)->getText();
    }

    public function submitProposalVoteForm()
    {
        $this->getElement('proposal vote form submit button')->click();
    }

    public function hoverVoteButton(int $id = 8)
    {
        $this->getVoteButton($id)->mouseOver();
    }

    protected function verifyUrl(array $urlParameters = [])
    {
        $expectedUrl = $this->getUrl($urlParameters);
        $currentUrl = $this->getSession()->getCurrentUrl();
        $proposalsUrl = $expectedUrl . '/proposals/';

        if ($currentUrl !== $expectedUrl) {
            if (false === strrpos($currentUrl, $proposalsUrl)) {
                throw new UnexpectedPageException(
                    sprintf(
                        'Expected to be on "%s" but found "%s" instead',
                        $this->getUrl($urlParameters),
                        $this->getSession()->getCurrentUrl()
                ));
            }
        }
    }
}
