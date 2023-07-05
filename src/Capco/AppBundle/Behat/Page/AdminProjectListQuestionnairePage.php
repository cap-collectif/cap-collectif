<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminProjectListQuestionnairePage extends Page
{
    use PageTrait;

    protected $path = '/admin-next/questionnaireList';

    protected $elements = [
        'add button' => '#btn-add-questionnaire',
    ];

    public function verifyPage()
    {
        if (
            !$this->getSession()->wait(
                10000,
                "$('#btn-add-questionnaire').length > 0"
            )
        ) {
            throw new \RuntimeException('AdminProjectListQuestionnairePage did not fully load, check selector in "verifyPage".');
        }
    }

    public function clickAddQuestionnaireButton()
    {
        $this->getElement('add button')->click();
    }
}
