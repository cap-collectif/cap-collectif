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
    ];

    public function voteForFirstComment()
    {
        $this->getElement('First comment vote button')->click();
    }

    public function getFirstCommentVoteCounter()
    {
        return $this->getElement('First comment vote counter')->getText();
    }
}
