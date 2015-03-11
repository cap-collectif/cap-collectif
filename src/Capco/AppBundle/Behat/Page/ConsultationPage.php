<?php

namespace Capco\AppBundle\Behat\Page;

use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ConsultationPage extends Page
{
    /**
     * @var string $path
     */
    protected $path = '/consultations/{slug}';

}
