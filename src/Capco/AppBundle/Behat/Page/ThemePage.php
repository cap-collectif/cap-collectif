<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ThemePage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/themes/{themeSlug}';

    protected $elements = [
      'idea' => '#idea-preview',
      'idea create button' => '#idea-create-button',
      'idea form submit button' => '#confirm-idea-create',
    ];

    public function getIdeaSelector()
    {
        return $this->getSelector('idea');
    }

    public function getIdeaCreateButtonSelector()
    {
        return $this->getSelector('idea create button');
    }

    public function clickIdeaCreateButton()
    {
        $this->getElement('idea create button')->click();
    }

    public function submitIdeaForm()
    {
        $this->getElement('idea form submit button')->click();
    }
}
