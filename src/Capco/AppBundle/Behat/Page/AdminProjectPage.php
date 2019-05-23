<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use Capco\AppBundle\Behat\Traits\AdminProjectTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminProjectPage extends Page
{
    use PageTrait;
    use AdminProjectTrait;

    protected $elements = [
        'add project button' => '#add-a-project-button',
        'submit project content' => '#submit-project-content',
        'project author select' => '#project-author',
        'project type select' => '#project-author'
    ];

    protected $path = '/admin/capco/app/project/list';

    public function clickAddButton()
    {
        $this->getElement('add project button')->click();
    }

    public function clickProjectTypeButton()
    {
        $this->getElement('add project button')->click();
    }
    
    public function submitModal()
    {
        $this->getElement('submit project content')->click();
    }
}
