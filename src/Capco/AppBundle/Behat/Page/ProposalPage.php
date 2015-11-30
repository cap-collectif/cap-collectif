<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ProposalPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}';

    protected $elements = [];

}
