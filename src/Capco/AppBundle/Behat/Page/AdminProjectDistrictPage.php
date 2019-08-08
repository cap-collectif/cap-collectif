<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use Capco\AppBundle\Behat\Traits\AdminProjectDistrictTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminProjectDistrictPage extends Page
{
    use PageTrait;
    use AdminProjectDistrictTrait;

    protected $elements = [
        'project district add button' => '.btn-outline-primary',
        'project district enable border' => '.react-toggle',
        'project district pick color' => '.saturation-black',
        'project district modal submit button' => '#js-sumbit-button',
        'project district delete button' => '.btn-outline-danger',
        'project district confirm delete popover' => '#btn-confirm-delete-field',
        'project district edit button' => '.btn-outline-warning',
    ];

    protected $path = '/admin/capco/app/district-projectdistrict/list';

    public function clickAddButton()
    {
        $this->getElement('project district add button')->click();
    }

    public function enableBorderCheckbox()
    {
        $this->getElement('project district enable border')->click();
    }

    public function pickAColor()
    {
        $this->getElement('project district pick color')->click();
    }

    public function submitModal()
    {
        $this->getElement('project district modal submit button')->click();
    }

    public function clickDeleteButton()
    {
        $this->getElement('project district delete button')->click();
    }

    public function clickConfirmDeletePopover()
    {
        $this->getElement('project district confirm delete popover')->click();
    }

    public function clickEditButton()
    {
        $this->getElement('project district edit button')->click();
    }
}
