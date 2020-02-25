<?php

namespace Capco\AppBundle\Behat\Traits;

use PHPUnit\Framework\Assert;

trait LocaleTrait
{
    /**
     * @Then the locale should be :locale
     */
    public function theLocaleShouldBe(string $locale): void
    {
        if ($this->symfonySession){
            Assert::assertEquals($locale, $this->symfonySession->get('_locale', $locale));
        } else {
            Assert::assertEquals($locale, $this->getSession()->getCookie('hl'));
        }
    }
}
