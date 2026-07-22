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
        'proposal actuality tab' => '#proposal-admin-page-tabs-tab-4',
        'proposal title' => '#proposal_title',
        'proposal summary' => '#proposal_summary',
        'proposal save' => '#proposal_admin_content_save',
        'proposal evaluation analysts groupes save' => '#proposal-evaluation-analysts-groupes-save',
        'proposal evaluation evaluate' => '#proposal-admin-page-tabs-pane-6 input[type="text"][id="proposal-admin-evaluation-responses0"]',
        'proposal evaluation evaluate more information' => '#proposal-admin-page-tabs-pane-6 textarea[type="textarea"][id="proposal-admin-evaluation-responses1"]',
        'proposal evaluation custom save' => '#proposal-evaluation-custom-save',
        'proposal evaluation presentation' => '#proposal-admin-page-tabs-pane-6 div[id="proposal-admin-evaluation-responses2"]',
        'proposal export' => '#proposal-follower-dropdown-export',
    ];

    public function clickSaveProposalContentButton()
    {
        $this->getElement('proposal save')->click();
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

        $element = $this->elements['proposal evaluation presentation'] . " > div:{$child}";
        $this->find('css', $element)->click();
    }
}
