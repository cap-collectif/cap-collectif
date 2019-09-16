<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminEventListPage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/event/list';

    protected $elements = [
        'import button' => '#AdminImportEventsButton-import',
        'import modal submit' => '#AdminImportEventsButton-submit',
        'add button' => 'a.sonata-action-element'
    ];

    public function clickImportButton()
    {
        $this->getElement('import button')->click();
    }

    public function submitImportModal()
    {
        $this->getElement('import modal submit')->click();
    }

    public function clickAddButton()
    {
        $this->getElement('add button')->click();
    }
}
