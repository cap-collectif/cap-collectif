<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminTrait
{
    /**
    * @When I go to the admin proposals page
    */
    public function iGoToTheAdminProposalsPage()
    {
        $this->visitPageWithParams('proposals admin page');
    }

    /**
    * @When I click the merge button
    */
    public function iClickTheMergeButton()
    {
      $this->navigationContext->getPage('proposals admin page')->clickCreateProposalMergeButton();
    }

}
