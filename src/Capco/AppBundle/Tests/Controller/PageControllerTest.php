<?php

namespace Capco\AppBundle\Tests\Controller;


use Capco\AppBundle\Tests\BaseTestHelper;

class PageControllerTest extends BaseTestHelper
{
    public function testShowPage()
    {
        $client = static::createClient();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $pages = $em->getRepository('CapcoAppBundle:Page')->findAll();

        foreach ($pages as $page) {

            $crawler = $client->request('GET', '/pages/'.$page->getSlug());

            if (!$page->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }
    }
}
