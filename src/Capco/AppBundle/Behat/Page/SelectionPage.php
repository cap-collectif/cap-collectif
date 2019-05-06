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
        'proposal preview UHJvcG9zYWw6cHJvcG9zYWwy' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWwy',
        'proposal votes counter UHJvcG9zYWw6cHJvcG9zYWwy' =>
            '#proposal-UHJvcG9zYWw6cHJvcG9zYWwy .card__counters__item--votes .card__counters__value',
        'proposal vote button UHJvcG9zYWw6cHJvcG9zYWwy' =>
            'button#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwy',
        'proposal comments counter UHJvcG9zYWw6cHJvcG9zYWwy' =>
            '#proposal-UHJvcG9zYWw6cHJvcG9zYWwy .card__counters__item--comments .card__counters__value',
        'proposal preview UHJvcG9zYWw6cHJvcG9zYWwxMA' =>
            "[id='proposal-UHJvcG9zYWw6cHJvcG9zYWwxMA==']",
        'proposal votes counter UHJvcG9zYWw6cHJvcG9zYWwxMA' =>
            "[id='proposal-UHJvcG9zYWw6cHJvcG9zYWwxMA== .card__counters__item--votes .card__counters__value'",
        'proposal vote button UHJvcG9zYWw6cHJvcG9zYWwxMA' =>
            "button[id='proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxMA'",
        'proposal comments counter UHJvcG9zYWw6cHJvcG9zYWwxMA' =>
            "[id='proposal-UHJvcG9zYWw6cHJvcG9zYWwxMA== .card__counters__item--comments .card__counters__value'",
        'proposal preview UHJvcG9zYWw6cHJvcG9zYWwxMQ' =>
            "#[id='proposal-UHJvcG9zYWw6cHJvcG9zYWwxMQ=='",
        'proposal votes counter UHJvcG9zYWw6cHJvcG9zYWwxMQ' =>
            "[id='proposal-UHJvcG9zYWw6cHJvcG9zYWwxMQ== .card__counters__item--votes .card__counters__value'",
        'proposal vote button UHJvcG9zYWw6cHJvcG9zYWwxMQ' =>
            'button#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxMQ',
        'proposal comments counter UHJvcG9zYWw6cHJvcG9zYWwxMQ' =>
            "[id='proposal-UHJvcG9zYWw6cHJvcG9zYWwxMQ== .card__counters__item--comments .card__counters__value'",
        'proposal preview UHJvcG9zYWw6cHJvcG9zYWw4' => '#proposal-UHJvcG9zYWw6cHJvcG9zYWw4',
        'proposal votes counter UHJvcG9zYWw6cHJvcG9zYWw4' =>
            '#proposal-UHJvcG9zYWw6cHJvcG9zYWw4 .card__counters__item--votes .card__counters__value',
        'proposal vote button UHJvcG9zYWw6cHJvcG9zYWw4' =>
            'button#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWw4',
        'proposal comments counter UHJvcG9zYWw6cHJvcG9zYWw4' =>
            '#proposal-UHJvcG9zYWw6cHJvcG9zYWw4 .card__counters__item--comments .card__counters__value',
        'proposal' => '.proposal-preview',
        'proposal vote button to hover' => '#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwx',
        'sorting select' => 'select#proposal-filter-sorting-button',
        'proposal vote form submit button' => '#confirm-proposal-vote',
        'proposal vote button UHJvcG9zYWw6cHJvcG9zYWwxOA==' =>
            "button[id='proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxOA==']",
        'proposal vote button UHJvcG9zYWw6cHJvcG9zYWwxNw==' =>
            "button[id='proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxNw==']",
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
        return $this->getElement("proposal vote button ${id}");
    }

    public function getVoteButtonSelector(string $id = 'UHJvcG9zYWw6cHJvcG9zYWwy'): string
    {
        return $this->getSelector("proposal vote button ${id}");
    }

    public function clickVoteButton(string $id = 'UHJvcG9zYWw6cHJvcG9zYWwy')
    {
        $button = $this->getVoteButton($id);

        try {
            $button
                ->getParent()
                ->getParent()
                ->getParent()
                ->getParent()
                ->mouseOver();
            $button->click();
        } catch (\Exception $e) {
            $button
                ->getParent()
                ->getParent()
                ->getParent()
                ->click();
        }
    }

    public function getVoteButtonLabel(string $id = 'UHJvcG9zYWw6cHJvcG9zYWwy')
    {
        return $this->getVoteButton($id)->getText();
    }

    public function getVotesCounter(string $id)
    {
        return $this->getElement('proposal votes counter ' . $id);
    }

    public function getVotesCount(string $id = 'UHJvcG9zYWw6cHJvcG9zYWwy'): int
    {
        return (int) filter_var($this->getVotesCounter($id)->getText(), FILTER_SANITIZE_NUMBER_INT);
    }

    public function getCommentsCounter(string $id)
    {
        return $this->getElement('proposal comments counter ' . $id);
    }

    public function getCommentsCount(string $id = 'UHJvcG9zYWw6cHJvcG9zYWwy'): int
    {
        return (int) filter_var(
            $this->getCommentsCounter($id)->getText(),
            FILTER_SANITIZE_NUMBER_INT
        );
    }

    public function submitProposalVoteForm()
    {
        $this->getElement('proposal vote form submit button')->click();
    }

    public function hoverVoteButton(string $id = 'UHJvcG9zYWw6cHJvcG9zYWw4')
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
                    )
                );
            }
        }
    }
}
