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
        'vote proposal button' => '.proposal__button__vote',
        'proposal vote form submit button' => '#confirm-proposal-vote',
        'create proposal button' => '#add-proposal',
        'proposal form submit button' => '#confirm-proposal-create',
        'proposal form submit draft button' => '#confirm-proposal-create-as-draft',
        'sorting select' => 'select#proposal-filter-sorting-button',
        'follow proposal button' => '.proposal__button__follow',
        'type of follow proposal' => '.proposal__follow',
        'my votes' => '.widget__button.navbar-btn.pull-right.btn.btn-default',
        'restricted-access' => '#restricted-access',
        'restricted-access-link' => '#restricted-access > button',
        'restricted-group-link' => ' > button',
    ];

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        if (
            !$this->getSession()->wait(
                10000,
                "window.jQuery && $('#ProposalStepPage-rendered').length > 0"
            )
        ) {
            throw new \RuntimeException(
                'CollectPage did not fully load, check selector in "verifyPage".'
            );
        }
    }

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

    public function clickFollowProposalButton()
    {
        return $this->getElement('follow proposal button')->click();
    }

    public function clickMyVotesButton()
    {
        return $this->getElement('my votes')->click();
    }

    public function isFollowedAs(string $type)
    {
        $element = $this->elements['type of follow proposal'] . "__${type}";

        return $this->find('css', $element)->isChecked();
    }

    public function changeTypeOfProposalFollow(string $type)
    {
        $element = $this->elements['type of follow proposal'] . "__${type}";

        return $this->find('css', $element)->click();
    }

    public function clickOnRestrictedAccess()
    {
        $this->getElement('restricted-access')->click();

        return $this->getElement('restricted-access-link')->click();
    }

    public function iClickOnUserGroupModal(string $groupId)
    {
        $selector = "#${groupId}" . $this->getSelector('restricted-group-link');

        $element = $this->find('css', $selector);
        if (!$element) {
            throw new \RuntimeException('Could not find: ' . $selector);
        }

        return $element->click();
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
                    )
                );
            }
        }
    }
}
