<?php

namespace Capco\AppBundle\Tests\Controller;


use Capco\AppBundle\Tests\BaseTestHelper;

class DefaultControllerTest extends BaseTestHelper
{
    public function testContact()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/contact');

        $this->assertTrue($client->getResponse()->isSuccessful());
    }

    public function testShieldMode()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $toggleManager->activate('shield_mode');
        $crawler = $client->request('GET', '/');
        $this->assertEquals("401", $client->getResponse()->getStatusCode());

        $crawler = $client->request('GET', '/', array(), array(), array(
            'PHP_AUTH_USER' => 'admin',
            'PHP_AUTH_PW'   => 'admin',
        ));
        $this->assertTrue($client->getResponse()->isSuccessful());

        $toggleManager->deactivate('shield_mode');
        $crawler = $client->request('GET', '/');
        $this->assertTrue($client->getResponse()->isSuccessful());
    }
}
