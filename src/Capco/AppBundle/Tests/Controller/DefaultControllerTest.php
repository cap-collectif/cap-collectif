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
}
