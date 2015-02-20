<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class OpinionControllerTest extends BaseTestHelper
{

    public function testShowOpinion()
    {
        $client = static::createClient();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $opinions = $em->getRepository('CapcoAppBundle:Opinion')->findAll();

        foreach ($opinions as $opinion) {

            $crawler = $client->request('GET', '/consultations/'.$opinion->getConsultation()->getSlug().'/opinions/'.$opinion->getOpinionType()->getSlug().'/'.$opinion->getSlug());

            if (!$opinion->canDisplay()) {
                $this->assertTrue($client->getResponse()->isNotFound());
            } else {
                $this->assertTrue($client->getResponse()->isSuccessful());
            }

        }

    }

    public function testCreateOpinion()
    {
        $client = static::createClient();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');
        $consultations = $em->getRepository('CapcoAppBundle:Consultation')->findAll();
        $opinionTypes = $em->getRepository('CapcoAppBundle:OpinionType')->findAll();

        foreach ($consultations as $consultation) {
            foreach ($opinionTypes as $ot) {

                $client = static::createClient();
                $crawler = $client->request('GET', '/consultations/'.$consultation->getSlug().'/opinions/'.$ot->getSlug().'/add');
                $this->assertEquals("302", $client->getResponse()->getStatusCode());

                $client = $this->getLoggedClient();
                $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
                $crawler = $client->request('GET', '/consultations/'.$consultation->getSlug().'/opinions/'.$ot->getSlug().'/add');
                $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

                if (!$consultation->canContribute()) {
                    $this->assertEquals("403", $client->getResponse()->getStatusCode());
                } else if (!$ot->getIsEnabled()) {
                    $this->assertEquals("404", $client->getResponse()->getStatusCode());
                } else {
                    $this->assertEquals("200", $client->getResponse()->getStatusCode());
                }
            }
        }
    }

    public function testUpdateOpinion()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $opinions = $em->getRepository('CapcoAppBundle:Opinion')->findAll();

        foreach ($opinions as $opinion) {

            $crawler = $client->request('GET',
                '/consultations/' . $opinion->getConsultation()->getSlug() . '/opinions/' . $opinion->getOpinionType(
                )->getSlug() . '/' . $opinion->getSlug() . '/edit'
            );

            if (!$opinion->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$opinion->canContribute()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if ($user != $opinion->getAuthor()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }

    public function testDeleteOpinion()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $opinions = $em->getRepository('CapcoAppBundle:Opinion')->findAll();

        foreach ($opinions as $opinion) {

            $crawler = $client->request('GET', '/consultations/'.$opinion->getConsultation()->getSlug().'/opinions/'.$opinion->getOpinionType()->getSlug().'/'.$opinion->getSlug().'/delete');

            if (!$opinion->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$opinion->canContribute()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if ($user != $opinion->getAuthor()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }
}
