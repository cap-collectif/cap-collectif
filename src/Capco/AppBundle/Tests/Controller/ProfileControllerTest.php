<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class ProfileControllerTest extends BaseTestHelper
{
    public function testShowProfile()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $crawler = $client->request('GET', '/profile/');
        $this->assertEquals("200", $client->getResponse()->getStatusCode());

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $users = $em->getRepository('CapcoUserBundle:User')->findAll();

        foreach ($users as $user) {

            $crawler = $client->request('GET', '/profile/user/'.$user->getSlug());

            if (!$user->isEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }
}
