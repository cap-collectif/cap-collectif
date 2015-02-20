<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class StepControllerTest extends BaseTestHelper
{
    public function testShowStep()
    {
        $client = static::createClient();

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $steps = $em->getRepository('CapcoAppBundle:Step')->findAll();

        foreach ($steps as $step) {

            $crawler = $client->request('GET', '/consultation/'.$step->getConsultation()->getSlug().'/step/'.$step->getSlug());

            if (!$step->getConsultation()->canDisplay()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if ($step->isConsultationStep()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }
}
