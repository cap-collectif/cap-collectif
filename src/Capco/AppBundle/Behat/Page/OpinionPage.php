<?php

namespace Capco\AppBundle\Behat\Page;

use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class OpinionPage extends Page
{
    /**
     * @var string $path
     */
    protected $path = '/consultations/{consultation_slug}/opinions/{opinion_type_slug}/{opinion_slug}';

    protected $elements = array(
        // Arguments
        'Argument yes field' => '#argyes-input',
        'Argument yes buttons' => '.argyes-btns',
        'Argument no field' => '#argno-input',
        'Argument no buttons' => '.argno-btns',
        'Sources list' => '.sources__panel',
        'Vote first source' => '.panel-body .media form',
    );

    public function submitArgument($type, $text)
    {
        $field = $this->getElement('Argument '.$type.' field');
        $button = $this->getElement('Argument '.$type.' buttons')->findButton("Publier");
        $field->setValue($text);
        $button->press();
    }

    public function collapseSourcesList()
    {
        $this->getElement('Sources list')->click();
    }

    public function voteForFirstSource()
    {
        $this->getElement('Vote first source')->click();
    }
}

