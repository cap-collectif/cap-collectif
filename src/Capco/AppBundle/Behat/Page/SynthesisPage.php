<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\UnexpectedPageException;

class SynthesisPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/project/{projectSlug}/synthesis/{stepSlug}';

    protected $elements = [
        'synthesis view' => '.synthesis__view',
    ];

    public function getSynthesisViewSelector()
    {
        return $this->getSelector('synthesis view');
    }
}
