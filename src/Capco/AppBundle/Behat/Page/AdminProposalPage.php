<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminProposalPage extends Page
{
    use PageTrait;

    protected $path = 'admin/capco/app/proposal/{proposalid}/edit';

    protected $elements = [
        'proposal content tab' => '#proposal-admin-page-tabs-tab-1',
        'proposal advancement tab' => '#proposal-admin-page-tabs-tab-2',
        'proposal actuality tab' => '#proposal-admin-page-tabs-tab-3',
        'proposal followers tab' => '#proposal-admin-page-tabs-tab-4',
        'proposal evaluation tab' => '#proposal-admin-page-tabs-tab-5',
        'proposal status tab' => '#proposal-admin-page-tabs-tab-6',
        'proposal title' => '#proposal_title',
        'proposal summary' => '#proposal_summary',
        'proposal save' => '#proposal_admin_content_save',
        'proposal advancement selection' => '#item_0 .form-group .react-toggle',
        'proposal advancement winner' => '#item_0 .form-group .react-toggle',
        'proposal advancement closed' => '#item_1 .form-group .react-toggle',
        'proposal advancement selection to come' => '#item_2 .form-group .react-toggle',
        'proposal advancement realisation to come' => '#item_3 .form-group .react-toggle',
        'proposal advancement selection status' => '#item_0 select',
        'proposal advancement save' => '#proposal_advancement_save',
        'proposal evaluation analysts groupes save' => '#proposal-evaluation-analysts-groupes-save',
        'proposal evaluation evaluate' =>
            '#proposal-admin-page-tabs-pane-5 input[type="text"][id="proposal-admin-evaluation-responses[0]"]',
        'proposal evaluation evaluate more information' =>
            '#proposal-admin-page-tabs-pane-5 textarea[type="textarea"][id="proposal-admin-evaluation-responses[1]"]',
        'proposal evaluation custom save' => '#proposal-evaluation-custom-save',
        'proposal evaluation presentation' =>
            '#proposal-admin-page-tabs-pane-5 div[id="proposal-admin-evaluation-responses[2]"]',
        'proposal export' => '#proposal-follower-dropdown-export',
    ];

    public function clickSaveProposalContentButton()
    {
        $this->getElement('proposal save')->click();
    }

    public function clickSaveProposalAdvancementButton()
    {
        $this->getElement('proposal advancement save')->click();
    }

    public function toggleProposalElement(string $element)
    {
        $this->getElement($element)->click();
    }

    public function selectProposalAdvancementStatus(string $status, string $element)
    {
        return $this->getElement($element)->selectOption($status);
    }

    public function clickSaveProposalEvaluationAnalystsGroupes()
    {
        $this->getElement('proposal evaluation analysts groupes save')->click();
    }

    public function saveCustomEvaluation()
    {
        $this->getElement('proposal evaluation custom save')->click();
    }

    public function evaluateProposalPresentation(string $value)
    {
        $child = 'first-child';
        if ('Du pur bullshit' === $value) {
            $child = 'last-child';
        }

        $element = $this->elements['proposal evaluation presentation'] . " > div:$child";
        $this->find('css', $element)->click();
    }
}
