<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ProjectTrashedPage extends Page
{
    use PageTrait;

    protected $path = '/projects/{projectSlug}/trashed';
}
