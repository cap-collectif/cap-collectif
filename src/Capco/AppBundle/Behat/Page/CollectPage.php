<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\UnexpectedPageException;

class CollectPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/projects/{projectSlug}/collect/{stepSlug}';

    protected $elements = [
    ];

    protected function verifyUrl(array $urlParameters = [])
    {
        $expectedUrl = $this->getUrl($urlParameters);
        $currentUrl = $this->getSession()->getCurrentUrl();
        $opinionTypeUrl = $expectedUrl.'/proposals/';

        if ($currentUrl !== $expectedUrl) {
            if (false === strrpos($currentUrl, $opinionTypeUrl)) {
                throw new UnexpectedPageException(
                    sprintf(
                        'Expected to be on "%s" but found "%s" instead',
                        $this->getUrl($urlParameters),
                        $this->getSession()->getCurrentUrl()
                ));
            }
        }
    }
}
