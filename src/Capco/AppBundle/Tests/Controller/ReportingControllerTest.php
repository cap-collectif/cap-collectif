<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class ReportingControllerTest extends BaseTestHelper
{
    public function testOpinionReporting()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $opinions = $em->getRepository('CapcoAppBundle:Opinion')->findAll();

        foreach ($opinions as $opinion) {

            $crawler = $client->request('GET', '/consultations/'.$opinion->getConsultation()->getSlug().'/opinions/'.$opinion->getOpinionType()->getSlug().'/'.$opinion->getSlug().'/report');
            if (!$opinion->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$opinion->canDisplay()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }

    public function testSourceReporting()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $sources = $em->getRepository('CapcoAppBundle:Source')->findAll();

        foreach ($sources as $source) {

            $crawler = $client->request('GET', '/consultations/'.$source->getOpinion()->getConsultation()->getSlug().'/opinions/'.$source->getOpinion()->getOpinionType()->getSlug().'/'.$source->getOpinion()->getSlug().'/sources/'.$source->getSlug().'/report');
            if (!$source->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$source->canDisplay()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }

    public function testIdeaReporting()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $ideas = $em->getRepository('CapcoAppBundle:Idea')->findAll();

        foreach ($ideas as $idea) {

            $crawler = $client->request('GET', '/ideas/'.$idea->getSlug().'/report');
            if (!$idea->canDisplay()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }
    }

    public function testArgumentReporting()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $arguments = $em->getRepository('CapcoAppBundle:Argument')->findAll();

        foreach ($arguments as $argument) {

            $crawler = $client->request('GET', '/consultations/'.$argument->getOpinion()->getConsultation()->getSlug().'/opinions/'.$argument->getOpinion()->getOpinionType()->getSlug().'/'.$argument->getOpinion()->getSlug().'/arguments/'.$argument->getId().'/report');
            if (!$argument->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$argument->canDisplay()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }
}
