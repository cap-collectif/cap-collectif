<?php

namespace Capco\AppBundle\Behat\Traits;

trait CookiesTrait
{
    /**
     * @When I toggle performance cookies
     */
    public function iTogglePerformanceCookies()
    {
        $this->waitAndThrowOnFailure(3000, "$('#cookies-performance').length > 0");

        $this->getCurrentPage()->togglePerformance();
    }

    /**
     * @When I toggle advertising cookies
     */
    public function iToggleAdvertisingCookies()
    {
        $this->waitAndThrowOnFailure(3000, "$('#cookies-advertising').length > 0");

        $this->getCurrentPage()->toggleAdvertising();
    }
}
