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
        'proposal evaluation tab' => '#proposal-admin-page-tabs-tab-4',
        'proposal status tab' => '#proposal-admin-page-tabs-tab-5',
        'proposal title' => '#proposal_title',
        'proposal summary' => '#proposal_summary',
        'proposal save' => '#proposal_admin_content_save',
    ];

    public function clickSaveContentProposalButton()
    {
        $this->getElement('proposal save')->click();
    }

    public function clickAdvancementTab()
    {
        $this->getElement('proposal advancement tab')->click();
    }
}
