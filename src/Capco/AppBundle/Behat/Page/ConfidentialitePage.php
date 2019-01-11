<?php
namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ConfidentialitePage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/confidentialite';

    public $elements = [
        'toggle performance' =>
            '#cookies-performance > div > div > div.react-toggle > div.react-toggle-track',
        'toggle advertising' =>
            '#cookies-advertising > div > div > div.react-toggle > div.react-toggle-track',
    ];

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
