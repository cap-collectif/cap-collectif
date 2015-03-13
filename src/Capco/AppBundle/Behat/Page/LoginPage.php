<?php

namespace Capco\AppBundle\Behat\Page;

use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class LoginPage extends Page
{
    /**
     * @var string $path
     */
    protected $path = '/login';

    protected $elements = array(
        'Connection form' => '#login-form',
    );


}
