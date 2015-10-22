<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class OpinionPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}';

    protected $elements = array(
        // Arguments
        'Argument yes field' => '#argument-form--yes textarea',
        'Argument yes button' => '#argument-form--yes button',
        'Argument no field' => '#argument-form--no textarea',
        'Argument no button' => '#argument-form--no button',
        'first source vote count' => '#sources-list li:first-child .opinion__votes-nb',
        'Vote first source' => '#sources-list li:first-child .source__btn--vote',
        'sources tab' => '#opinion__sources___tab',
        'source add' => '#source-form__add',
        'arguments tab' => '#opinion__arguments___tab',
    );

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
        $this->getElement('source add')->click();
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
}
