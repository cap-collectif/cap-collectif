<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class SourceControllerTest extends BaseTestHelper
{
    public function testUpdateSource()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $sources = $em->getRepository('CapcoAppBundle:Source')->findAll();

        foreach ($sources as $source) {

            $crawler = $client->request('GET', '/consultations/'.$source->getOpinion()->getConsultation()->getSlug().'/opinions/'.$source->getOpinion()->getOpinionType()->getSlug().'/'.$source->getOpinion()->getSlug().'/sources/'.$source->getSlug().'/edit');

            if (!$source->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$source->canContribute()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if ($user != $source->getAuthor()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }

    public function testDeleteSource()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $sources = $em->getRepository('CapcoAppBundle:Source')->findAll();

        foreach ($sources as $source) {

            $crawler = $client->request('GET', '/consultations/'.$source->getOpinion()->getConsultation()->getSlug().'/opinions/'.$source->getOpinion()->getOpinionType()->getSlug().'/'.$source->getOpinion()->getSlug().'/sources/'.$source->getSlug().'/delete');

            if (!$source->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$source->canContribute()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if ($user != $source->getAuthor()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }
    }

    public function testCreateSource()
    {
        $client = static::createClient();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');
        $opinions = $em->getRepository('CapcoAppBundle:Opinion')->findAll();

        foreach ($opinions as $opinion) {

            $client = static::createClient();
            $crawler = $client->request('GET', '/consultations/'.$opinion->getConsultation()->getSlug().'/opinions/'.$opinion->getOpinionType()->getSlug().'/'.$opinion->getSlug().'/sources/add');
            $this->assertEquals("302", $client->getResponse()->getStatusCode());

            $client = $this->getLoggedClient();
            $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
            $crawler = $client->request('GET', '/consultations/'.$opinion->getConsultation()->getSlug().'/opinions/'.$opinion->getOpinionType()->getSlug().'/'.$opinion->getSlug().'/sources/add');
            $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

            if (!$opinion->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$opinion->canContribute()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }
}
