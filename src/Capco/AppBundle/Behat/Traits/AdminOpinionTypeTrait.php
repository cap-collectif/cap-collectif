<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminOpinionTypeTrait
{
    /**
     * @When I go to admin opinion type page with opinionTypeId :opionionTypeId
     */
    public function iGoToTheAdminOpinionTypePageWithId(string $opinionTypeId)
    {
        $this->visitPageWithParams('admin opinion type page', ['opinionTypeId' => $opinionTypeId]);
    }
}
