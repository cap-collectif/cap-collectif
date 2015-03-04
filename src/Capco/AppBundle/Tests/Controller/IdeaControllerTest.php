<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class IdeaControllerTest extends BaseTestHelper
{
    public function testIdeaIndex()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $toggleManager->deactivate('ideas');
        $crawler = $client->request('GET', '/ideas');
        $this->assertEquals("404", $client->getResponse()->getStatusCode());

        $toggleManager->activate('ideas');
        $crawler = $client->request('GET', '/ideas');
        $this->assertTrue($client->getResponse()->isSuccessful());

        $nbDisplayedIdeas = $crawler->filter('.media--macro')->count();
        $this->assertEquals("3", $nbDisplayedIdeas);
    }

    public function testTrashedIdeasIndex()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $toggleManager->deactivate('ideas');
        $crawler = $client->request('GET', '/ideas/trashed');
        $this->assertEquals("404", $client->getResponse()->getStatusCode());

        $toggleManager->activate('ideas');
        $crawler = $client->request('GET', '/ideas/trashed');
        $this->assertTrue($client->getResponse()->isSuccessful());

        $nbDisplayedIdeas = $crawler->filter('.media--macro')->count();
        $this->assertEquals("1", $nbDisplayedIdeas);
    }

    public function testIdeaShow()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $ideas = $em->getRepository('CapcoAppBundle:Idea')->findAll();

        foreach ($ideas as $idea) {

            $toggleManager->deactivate('ideas');
            $crawler = $client->request('GET', '/ideas/'.$idea->getSlug());
            $this->assertEquals("404", $client->getResponse()->getStatusCode());

            $toggleManager->activate('ideas');
            $crawler = $client->request('GET', '/ideas/'.$idea->getSlug());

            if (!$idea->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
                if ($idea->getTitle() == "Idée admin" ) {
                    $nbDisplayedComments = $crawler->filter('.opinion--comment:not(.opinion--add-comment)')->count();
                    $this->assertEquals("1", $nbDisplayedComments);
                }
            }
        }

    }

    public function testCreateIdea()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ideas/add');
        $this->assertEquals("302", $client->getResponse()->getStatusCode());

        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $toggleManager->deactivate('ideas');
        $crawler = $client->request('GET', '/ideas/add');
        $this->assertEquals("404", $client->getResponse()->getStatusCode());

        $toggleManager->activate('ideas');
        $crawler = $client->request('GET', '/ideas/add');
        $this->assertEquals("200", $client->getResponse()->getStatusCode());
    }

    public function testUpdateIdea()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $ideas = $em->getRepository('CapcoAppBundle:Idea')->findAll();

        foreach ($ideas as $idea) {

            $toggleManager->deactivate('ideas');
            $crawler = $client->request('GET', '/ideas/'.$idea->getSlug().'/edit');
            $this->assertEquals("404", $client->getResponse()->getStatusCode());

            $toggleManager->activate('ideas');

            $crawler = $client->request('GET', '/ideas/'.$idea->getSlug().'/edit');

            if (!$idea->getIsEnabled()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if (!$idea->canContribute()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if ($user != $idea->getAuthor()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }

    public function testDeleteIdea()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $ideas = $em->getRepository('CapcoAppBundle:Idea')->findAll();

        foreach ($ideas as $idea) {

            $toggleManager->deactivate('ideas');
            $crawler = $client->request('GET', '/ideas/' . $idea->getSlug() . '/delete');
            $this->assertEquals("404", $client->getResponse()->getStatusCode());

            $toggleManager->activate('ideas');

            $crawler = $client->request('GET', '/ideas/' . $idea->getSlug() . '/delete');

            if (!$idea->getIsEnabled()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if (!$idea->canContribute()) {
                    $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if ($user != $idea->getAuthor()) {
                    $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }
    }
}
