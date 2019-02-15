<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class CookiesPage extends Page
{
    use PageTrait;

    public $elements = [
        'toggle performance' =>
            '#cookies-performance > div > div > div.react-toggle > div.react-toggle-track',
        'toggle advertising' =>
            '#cookies-advertising > div > div > div.react-toggle > div.react-toggle-track',
    ];

    /**
     * @var string
     */
    protected $path = '/cookies-management';

    public function togglePerformance()
    {
        $element = $this->elements['toggle performance'];

        return $this->find('css', $element)->click();
    }

    public function toggleAdvertising()
    {
        $element = $this->elements['toggle advertising'];

        return $this->find('css', $element)->click();
    }
}
