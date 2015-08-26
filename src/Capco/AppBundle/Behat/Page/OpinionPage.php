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
        'Argument yes field' => '#argyes-input',
        'Argument yes buttons' => '.argyes-btns',
        'Argument no field' => '#argno-input',
        'Argument no buttons' => '.argno-btns',
        'Sources list' => '.panel--sources .panel-heading',
        'first source vote count' => '#render-opinion-sources li:first-child .opinion__votes-nb',
        'Vote first source' => '#render-opinion-sources li:first-child .btn',
        'sources tab' => '#sourcesTab',
        'source add' => '#addSourceButton',
    );

    public function clickSourcesTab()
    {
        $this->getElement('sources tab')->click();
    }

    public function clickAddSource()
    {
        $this->getElement('source add')->click();
    }

    public function submitArgument($type, $text)
    {
        $field = $this->getElement('Argument '.$type.' field');
        $button = $this->getElement('Argument '.$type.' buttons')->findButton('Publier');
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
