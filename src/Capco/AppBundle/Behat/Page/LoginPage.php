<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class LoginPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/login';

    protected $elements = [
        'Connection form' => '#login-form',
    ];
}
