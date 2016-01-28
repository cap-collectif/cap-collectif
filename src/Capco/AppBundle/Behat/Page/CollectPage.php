<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\UnexpectedPageException;

class CollectPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/project/{projectSlug}/collect/{stepSlug}';

    protected $elements = [
        'proposal' => '.proposal__preview',
        'create proposal button' => '#add-proposal',
        'proposal form submit button' => '#confirm-proposal-create',
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

    public function clickCreateProposalButton()
    {
        $this->getElement('create proposal button')->click();
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
        $opinionTypeUrl = $expectedUrl.'/proposals/';

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
