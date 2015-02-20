<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Symfony\Component\HttpFoundation\Response;

class ArgumentControllerTest extends BaseTestHelper
{

    public function testDeleteArgument()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $arguments = $em->getRepository('CapcoAppBundle:Argument')->findAll();

        foreach ($arguments as $argument) {

            $crawler = $client->request('GET', '/consultations/'.$argument->getOpinion()->getConsultation()->getSlug().'/opinions/'.$argument->getOpinion()->getOpinionType()->getSlug().'/'.$argument->getOpinion()->getSlug().'/arguments/'.$argument->getId().'/delete');

            if (!$argument->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$argument->canContribute()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if ($user != $argument->getAuthor()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }

    public function testUpdateArgument()
    {
        $client = $this->getLoggedClient();
        $this->assertTrue($client->getContainer()->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED'));
        $user = $client->getContainer()->get('security.token_storage')->getToken()->getUser();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $arguments = $em->getRepository('CapcoAppBundle:Argument')->findAll();

        foreach ($arguments as $argument) {

            $crawler = $client->request('GET', '/consultations/'.$argument->getOpinion()->getConsultation()->getSlug().'/opinions/'.$argument->getOpinion()->getOpinionType()->getSlug().'/'.$argument->getOpinion()->getSlug().'/arguments/'.$argument->getId().'/edit');

            if (!$argument->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if (!$argument->canContribute()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else if ($user != $argument->getAuthor()) {
                $this->assertEquals("403", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }
}
