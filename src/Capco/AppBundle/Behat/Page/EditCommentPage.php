<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class EditCommentPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/comments/{id}/edit';

    protected $elements = [
        'delete button' => 'a.btn.btn-danger[href*="/delete"]',
        'cancel button' => 'a.btn.btn-default',
        'edit button' => 'button[type="submit"]',
        'confirm checkbox' => 'input[type="checkbox"][name="confirm"]',
    ];

    public function getCancelButton()
    {
        return $this->getElement('cancel button');
    }

    public function getDeleteButton()
    {
        return $this->getElement('delete button');
    }

    public function getEditButton()
    {
        return $this->getElement('edit button');
    }

    public function getConfirmCheckbox()
    {
        return $this->getElement('confirm checkbox');
    }

    public function clickDeleteButton()
    {
        $this->getDeleteButton()->click();
    }

    public function clickEditButton()
    {
        $this->getEditButton()->click();
    }

    public function clickCancelButton()
    {
        $this->getCancelButton()->click();
    }

    public function checkConfirmCheckbox()
    {
        $this->getConfirmCheckbox()->check();
    }

    public function uncheckConfirmCheckbox()
    {
        $this->getConfirmCheckbox()->uncheck();
    }

    public function submitEditForm()
    {
        $this->clickEditButton();
    }

    public function fillEditForm(string $body)
    {
        $this->fillField('body', $body);
        $this->checkConfirmCheckbox();
        $this->submitEditForm();
    }
}
