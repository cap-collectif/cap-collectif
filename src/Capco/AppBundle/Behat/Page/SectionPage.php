<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class SectionPage extends Page
{
    use PageTrait;

    protected $path = '/project/{projectSlug}/consultation/{stepSlug}/types/{sectionSlug}';
}
