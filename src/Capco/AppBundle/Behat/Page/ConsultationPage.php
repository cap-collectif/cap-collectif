<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ConsultationPage extends Page
{
    use PageTrait;

    /**
     * @var string $path
     */
    protected $path = '/consultations/{slug}';

    protected $elements = array(
        'Opinion nav bar' => '.consultation_nav',
        'Opinion nav item' => array(
            'css' => '.consultation_nav li',
        ),
    );

}
