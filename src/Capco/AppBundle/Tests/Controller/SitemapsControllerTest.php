<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class SitemapsControllerTest extends BaseTestHelper
{
    public function testSitemap()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/sitemap.xml');

        $this->assertTrue($client->getResponse()->isSuccessful());
    }
}
