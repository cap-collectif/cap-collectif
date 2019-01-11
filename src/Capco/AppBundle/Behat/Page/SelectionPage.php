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
        'proposal preview proposal2' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwy',
        'proposal votes counter proposal2' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwy .card__counter-votes .card__counter__value',
        'proposal vote button proposal2' => 'button#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwy',
        'proposal comments counter proposal2' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwy .card__counter-comments .card__counter__value',
        'proposal preview proposal10' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwxMA==',
        'proposal votes counter proposal10' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwxMA== .card__counter-votes .card__counter__value',
        'proposal vote button proposal10' => 'button#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxMA',
        'proposal comments counter proposal10' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwxMA== .card__counter-comments .card__counter__value',
        'proposal preview proposal11' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwxMQ==',
        'proposal votes counter proposal11' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwxMQ== .card__counter-votes .card__counter__value',
        'proposal vote button proposal11' => 'button#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxMQ',
        'proposal comments counter proposal11' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwxMQ== .card__counter-comments .card__counter__value',
        'proposal preview proposal8' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWw4',
        'proposal votes counter proposal8' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWw4 .card__counter-votes .card__counter__value',
        'proposal vote button proposal8' => 'button#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWw4',
        'proposal comments counter proposal8' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWw4 .card__counter-comments .card__counter__value',
        'proposal' => '.proposal-preview',
        'proposal vote button to hover' => '#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwx',
        'sorting select' => 'select#proposal-sorting',
        'selected sorting option' => '#proposal-sorting option[selected]',
        'proposal vote form submit button' => '#confirm-proposal-vote',
        'proposal vote button proposal18' => 'button#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxOA==',
        'proposal vote button proposal17' => 'button#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxNw==',
    ];

    public function sortByDate()
    {
        $this->getElement('sorting select')->selectOption('global.filter_f_last');
    }

    public function sortByComments()
    {
        $this->getElement('sorting select')->selectOption('global.filter_f_comments');
    }

    public function getSelectedSortingOption()
    {
        return $this->getElement('sorting select')->getValue();
    }

    public function getProposalSelector(): string
    {
        return $this->getSelector('proposal');
    }

    public function getVoteButton(string $id)
    {
        return $this->getElement('proposal vote button ' . $id);
    }

    public function getVoteButtonSelector(string $id = 'proposal2'): string
    {
        return $this->getSelector('proposal vote button ' . $id);
    }

    public function clickVoteButton(string $id = 'proposal2')
    {
        $button = $this->getVoteButton($id);
        try {
            $button->getParent()->getParent()->getParent()->getParent()->mouseOver();
            $button->click();
        } catch (\Exception $e) {
            $button->getParent()->getParent()->getParent()->click();
        }
    }

    public function getVoteButtonLabel(string $id = 'proposal2')
    {
        return $this->getVoteButton($id)->getText();
    }

    public function getVotesCounter(string $id)
    {
        return $this->getElement('proposal votes counter ' . $id);
    }

    public function getVotesCount(string $id = 'proposal2'): int
    {
        return (int) filter_var($this->getVotesCounter($id)->getText(), FILTER_SANITIZE_NUMBER_INT);
    }

    public function getCommentsCounter(string $id)
    {
        return $this->getElement('proposal comments counter ' . $id);
    }

    public function getCommentsCount(string $id = 'proposal2'): int
    {
        return (int) filter_var($this->getCommentsCounter($id)->getText(), FILTER_SANITIZE_NUMBER_INT);
    }

    public function submitProposalVoteForm()
    {
        $this->getElement('proposal vote form submit button')->click();
    }

    public function hoverVoteButton(string $id = 'proposal8')
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
