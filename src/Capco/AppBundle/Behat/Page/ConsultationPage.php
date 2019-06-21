<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\UnexpectedPageException;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ConsultationPage extends Page
{
    use PageTrait;

    protected $path = '/project/{projectSlug}/consultation/{stepSlug}';

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        // TODO: replace this by a real condition to optimize loading time
        if (
            !$this->getSession()->wait(
                10000,
                "window.jQuery && ($('.section-list_container').length > 0 || $('.opinion-list-rendered').length > 0)"
            )
        ) {
            throw new \RuntimeException(
                'ConsultationPage did not fully load, check selector in "verifyPage".'
            );
        }
    }

    protected function verifyUrl(array $urlParameters = [])
    {
        $expectedUrl = $this->getUrl($urlParameters);
        $currentUrl = $this->getSession()->getCurrentUrl();
        $opinionTypeUrl = $expectedUrl . '/opinions/';

        if ($currentUrl !== $expectedUrl) {
            if (false === strrpos($currentUrl, $opinionTypeUrl)) {
                throw new UnexpectedPageException(
                    sprintf(
                        'Expected to be on "%s" but found "%s" instead',
                        $this->getUrl($urlParameters),
                        $this->getSession()->getCurrentUrl()
                    )
                );
            }
        }
    }
}
