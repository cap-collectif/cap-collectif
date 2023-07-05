<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

/**
 * @deprecated this is our legacy evaluation tool
 */
class EvaluationsPage extends Page
{
    use PageTrait;

    protected $path = '/evaluations';
}
