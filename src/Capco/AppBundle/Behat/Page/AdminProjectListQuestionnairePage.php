<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminProjectListQuestionnairePage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/questionnaire/list';

    protected $elements = [
        'add button' => '#add-questionnaire'
    ];

    public function clickAddQuestionnaireButton()
    {
        $this->getElement('add button')->click();
    }
}
