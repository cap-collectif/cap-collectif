<?php

namespace Capco\AppBundle\Tests;

use Liip\FunctionalTestBundle\Test\WebTestCase;
use Doctrine\Common\DataFixtures\Loader;
use Capco\AppBundle\DataFixtures\ORM\LoaderDataFixture;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\HttpFoundation\Session\Storage\MockFileSessionStorage;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\BrowserKit\CookieJar;

class BaseTestHelper extends WebTestCase
{
    protected $email = 'admin@test.com';
    protected $password = 'admin';

    protected $client;

    public function getLoggedClient()
    {
        $this->client = static::createClient();
        $crawler = $this->client->request('GET', '/login');
        $form = $crawler->selectButton('Se connecter')->form(array(
            '_username'  => $this->email,
            '_password'  => $this->password,
        ));
        $this->client->submit($form);

        $this->assertTrue($this->client->getResponse()->isRedirect());

        $crawler = $this->client->followRedirect();
        return $this->client;
    }

    protected function loadBaseFixtures ()
    {
        $classes = array(
            'Capco\AppBundle\Tests\TestFixtures\ORM\LoaderDataFixture',
        );
        $this->loadFixtures($classes);
    }

    protected function setUp()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');
        $toggleManager->deactivate('shield_mode');
    }


}
