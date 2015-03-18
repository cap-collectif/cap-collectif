<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class LoginPage extends Page
{
    use PageTrait;

    /**
     * @var string $path
     */
    protected $path = '/login';

    protected $elements = array(
        'Connection form' => '#login-form',
    );


}
