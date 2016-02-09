<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class OpinionVersionPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}';

    public $elements = [
        // Arguments
        'Argument yes field' => '#argument-form--yes textarea',
        'Argument yes button' => '#argument-form--yes button',
        'Argument no field' => '#argument-form--no textarea',
        'Argument no button' => '#argument-form--no button',
        'first source vote count' => '#sources-list li:first-child .opinion__votes-nb',
        'Vote first source' => '#sources-list li:first-child .source__btn--vote',
        'sources tab' => '#opinion__sources___tab',
        'sources add' => '#source-form__add',
        'arguments tab' => '#opinion__arguments___tab',
        'delete button' => '#opinion-delete',
        'confirm delete button' => '#confirm-opinion-delete',
        'show all votes button' => '#opinion-votes-show-all',
        'votes in modal' => '.opinion__votes__more__modal .opinion__votes__userbox',
    ];

    public function clickSourcesTab()
    {
        $this->getElement('sources tab')->click();
    }

    public function clickArgumentsTab()
    {
        $this->getElement('arguments tab')->click();
    }

    public function clickAddSource()
    {
        $this->getElement('sources add')->click();
    }

    public function submitArgument($type, $text)
    {
        $field = $this->getElement('Argument '.$type.' field');
        $button = $this->getElement('Argument '.$type.' button');
        $field->setValue($text);
        $button->press();
    }

    public function getFirstSourceVoteCounter()
    {
        return $this->getElement('first source vote count')->getText();
    }

    public function voteForFirstSource()
    {
        $this->getElement('Vote first source')->click();
    }

    public function clickDeleteButton()
    {
        $this->getElement('delete button')->click();
    }

    public function confirmDeletion()
    {
        $this->getElement('confirm delete button')->click();
    }

    public function getDeleteButtonSelector()
    {
        return $this->getSelector('delete button');
    }

    public function clickShowAllVotesButton()
    {
        $this->getElement('show all votes button')->click();
    }

    public function getVotesInModalSelector()
    {
        return $this->getSelector('votes in modal');
    }
}
