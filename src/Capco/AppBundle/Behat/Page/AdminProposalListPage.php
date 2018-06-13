<?php

namespace Capco\AppBundle\Behat\Page\Admin;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminProposalListPage extends Page
{
    use PageTrait;

    protected $path = '/admin/capco/app/proposal/list';

    protected $elements = [
        'create proposal merge button' => '#add-proposal-fusion',
        'submit proposal merge' => '#confirm-proposal-merge-create',
    ];

    public function clickCreateProposalMergeButton()
    {
        $this->getElement('create proposal merge button')->click();
    }

    public function clickSubmitProposalMergeButton()
    {
        $this->getElement('submit proposal merge')->click();
    }
}
