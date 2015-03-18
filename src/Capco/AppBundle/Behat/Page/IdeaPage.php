<?php

namespace Capco\AppBundle\Behat\Page;

use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class IdeaPage extends Page
{
    /**
     * @var string $path
     */
    protected $path = '/ideas/{slug}';

    protected $elements = [
        'Vote Button' => 'form[name="capco_app_idea_vote"] button',
        'Vote Counter' => 'form[name="capco_app_idea_vote"] span',
        'First comment vote button' => '.opinion--comment button',
        'First comment vote counter' => '.opinion--comment .opinion__votes-nb',
    ];

    public function vote()
    {
        $button = $this->getElement('Vote Button');
        $button->click();
    }

    public function getVoteCounterValue()
    {
        return $this->getElement('Vote Counter')->getText();
    }

    public function voteForFirstComment()
    {
        $this->getElement('First comment vote button')->click();
    }

    public function getFirstCommentVoteCounter()
    {
        return $this->getElement('First comment vote counter')->getText();
    }
}
