<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class IdeasPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/ideas';

    protected $elements = [
        'idea create button' => '#idea-create-button',
        'idea form submit button' => '#confirm-idea-create',
        'idea' => '#idea-preview',
        'sorting select' => 'select#idea-sorting',
        'selected sorting option' => '#idea-sorting option[selected]',
        'ideas trash link' => '#ideas-trash',
    ];

    public function clickIdeaCreateButton()
    {
        $this->getElement('idea create button')->click();
    }

    public function submitIdeaForm()
    {
        $this->getElement('idea form submit button')->click();
    }

    public function getIdeaSelector()
    {
        return $this->getSelector('idea');
    }

    public function sortByComments()
    {
        $this->getElement('sorting select')->selectOption('global.filter_f_comments');
    }

    public function getSelectedSortingOption()
    {
        return $this->getElement('sorting select')->getValue();
    }

    public function getIdeaCreateButtonSelector()
    {
        return $this->getSelector('idea create button');
    }

    public function clickIdeasTrashLink()
    {
        $this->getElement('ideas trash link')->click();
    }
}
