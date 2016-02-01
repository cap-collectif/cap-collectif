<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\UnexpectedPageException;

class SelectionPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/project/{projectSlug}/selection/{stepSlug}';

    protected $elements = [
        'proposal preview 2' => '#proposal-2',
        'proposal votes counter 2' => '#proposal-2 .proposal__counter--votes .proposal__counter__value',
        'proposal vote button 2' => '#proposal-2 .proposal__preview__vote',
        'proposal comments counter 2' => '#proposal-2 .proposal__counter--comments .proposal__counter__value',
        'proposal vote form submit button' => '#confirm-proposal-vote',
        'proposal preview 8' => '#proposal-8',
        'proposal votes counter 8' => '#proposal-8 .proposal__counter--votes .proposal__counter__value',
        'proposal vote button 8' => '#proposal-8 .proposal__preview__vote',
        'proposal comments counter 8' => '#proposal-8 .proposal__counter--comments .proposal__counter__value',
        'proposal' => '.proposal__preview',
        'proposal vote button to hover' => '#proposal-1 .proposal__preview__vote',
        'random sorting button' => '#proposal-sorting-random',
        'date sorting button' => '#proposal-sorting-last',
        'comments sorting button' => '#proposal-sorting-comments',
    ];

    public function getRandomSortingButtonSelector()
    {
        return $this->getSelector('random sorting button');
    }

    public function getDateSortingButtonSelector()
    {
        return $this->getSelector('date sorting button');
    }

    public function sortByDate()
    {
        $this->getElement('date sorting button')->click();
    }

    public function getCommentsSortingButtonSelector()
    {
        return $this->getSelector('comments sorting button');
    }

    public function sortByComments()
    {
        $this->getElement('comments sorting button')->click();
    }

    public function getProposalSelector()
    {
        return $this->getSelector('proposal');
    }

    public function getVoteButton($id)
    {
        return $this->getElement('proposal vote button '.$id);
    }

    public function getVoteButtonSelector($id = 2)
    {
        return $this->getSelector('proposal vote button '.$id);
    }

    public function clickVoteButton($id = 2)
    {
        $this->getVoteButton($id)->click();
    }

    public function getVoteButtonLabel($id = 2)
    {
        return $this->getVoteButton($id)->getText();
    }

    public function getVotesCounter($id)
    {
        return $this->getElement('proposal votes counter '.$id);
    }

    public function getVotesCount($id = 2)
    {
        return intval($this->getVotesCounter($id)->getText());
    }

    public function getCommentsCounter($id)
    {
        return $this->getElement('proposal comments counter '.$id);
    }

    public function getCommentsCount($id = 2)
    {
        return intval($this->getCommentsCounter($id)->getText());
    }

    public function submitProposalVoteForm()
    {
        $this->getElement('proposal vote form submit button')->click();
    }

    public function hoverOverVoteButton($id = 8)
    {
        $this->getVoteButton($id)->mouseOver();
    }

    protected function verifyUrl(array $urlParameters = [])
    {
        $expectedUrl = $this->getUrl($urlParameters);
        $currentUrl = $this->getSession()->getCurrentUrl();
        $proposalsUrl = $expectedUrl.'/proposals/';

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
