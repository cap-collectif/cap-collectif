<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\UnexpectedPageException;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class CollectPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/project/{projectSlug}/collect/{stepSlug}';

    protected $elements = [
        'proposal' => '.proposal-preview',
        'vote proposal button' => '.proposal__button__vote.btn.btn-success',
        'proposal vote form submit button' => '#confirm-proposal-vote',
        'create proposal button' => '#add-proposal',
        'proposal form submit button' => '#confirm-proposal-create',
        'proposal form submit draft button' => '#confirm-proposal-create-as-draft',
        'sorting select' => 'select#proposal-sorting',
        'selected sorting option' => '#proposal-sorting option[selected]',
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

    public function getProposalSelector()
    {
        return $this->getSelector('proposal');
    }

    public function clickCreateProposalButton()
    {
        $this->getElement('create proposal button')->click();
    }

    public function submitProposalVoteForm()
    {
        $this->getElement('proposal vote form submit button')->click();
    }

    public function clickVoteProposalButton()
    {
        $this->getElement('vote proposal button')->click();
    }

    public function getCreateProposalButton()
    {
        return $this->getElement('create proposal button');
    }

    public function submitProposalForm()
    {
        $this->getElement('proposal form submit button')->click();
    }

    protected function verifyUrl(array $urlParameters = [])
    {
        $expectedUrl = $this->getUrl($urlParameters);
        $currentUrl = $this->getSession()->getCurrentUrl();
        $opinionTypeUrl = $expectedUrl . '/proposals/';

        if ($currentUrl !== $expectedUrl) {
            if (false === strrpos($currentUrl, $opinionTypeUrl)) {
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
