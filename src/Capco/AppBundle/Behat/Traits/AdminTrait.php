<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminTrait
{
    /**
    * @When I go to the admin proposals page
    */
    public function iGoToTheAdminProposalsPage()
    {
        $this->visitPageWithParams('admin proposal page');
    }

    /**
    * @When I click the create merge button
    */
    public function iClickTheMergeButton()
    {
      $this->navigationContext->getPage('proposals admin page')->clickCreateProposalMergeButton();
    }

    /**
    * @When I fill the proposal merge form
    */
    public function iFillTheProposalMergeForm()
    {
      // $this->navigationContext->getPage('proposals admin page')->clickCreateProposalMergeButton();
    }

    /**
    * @When I submit the create merge form
    */
    public function iSubmitTheCreateMergeForm()
    {

    }

}
