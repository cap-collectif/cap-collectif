<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class ConsultationControllerTest extends BaseTestHelper
{
    public function testConsultationIndex()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/consultations');

        $this->assertTrue($client->getResponse()->isSuccessful());

        $nbDisplayedConsultations = $crawler->filter('.thumbnail--custom')->count();
        $this->assertEquals("2", $nbDisplayedConsultations);
    }

    public function testConsultationShow()
    {
        $client = static::createClient();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $consultations = $em->getRepository('CapcoAppBundle:Consultation')->findAll();

        foreach ($consultations as $consultation) {

            $crawler = $client->request('GET', '/consultations/'.$consultation->getSlug());

            if (!$consultation->canDisplay()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }
    }
}
