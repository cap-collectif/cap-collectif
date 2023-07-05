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
        $session = $this->getSession();
        if (null !== $session && !empty($session->getCookie('locale'))) {
            Assert::assertEquals($locale, $this->getSession()->getCookie('locale'));
        } else {
            Assert::assertEquals($locale, $this->symfonySession->get('_locale', $locale));
        }
    }
}
