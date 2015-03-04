<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class EventControllerTest extends BaseTestHelper
{
    public function testEventsIndex()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $toggleManager->deactivate('calendar');
        $crawler = $client->request('GET', '/events');
        $this->assertEquals("404", $client->getResponse()->getStatusCode());

        $toggleManager->activate('calendar');
        $crawler = $client->request('GET', '/events');
        $this->assertTrue($client->getResponse()->isSuccessful());

        $nbDisplayedEvents = $crawler->filter('.event')->count();
        $this->assertEquals("1", $nbDisplayedEvents);
    }

    public function testArchivedEventsIndex()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $toggleManager->deactivate('calendar');
        $crawler = $client->request('GET', '/events/archived');
        $this->assertEquals("404", $client->getResponse()->getStatusCode());

        $toggleManager->activate('calendar');
        $crawler = $client->request('GET', '/events/archived');
        $this->assertTrue($client->getResponse()->isSuccessful());

        $nbDisplayedEvents = $crawler->filter('.event')->count();
        $this->assertEquals("2", $nbDisplayedEvents);
    }

    public function testEventShow()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $events = $em->getRepository('CapcoAppBundle:Event')->findAll();

        foreach ($events as $event) {

            $toggleManager->deactivate('calendar');
            $crawler = $client->request('GET', '/events/'.$event->getSlug());
            $this->assertEquals("404", $client->getResponse()->getStatusCode());

            $toggleManager->activate('calendar');
            $crawler = $client->request('GET', '/events/'.$event->getSlug());

            if (!$event->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
                if ($event->getTitle() == "PHPTour2019" ) {
                    $nbDisplayedComments = $crawler->filter('.opinion--comment:not(.opinion--add-comment)')->count();
                    $this->assertEquals("2", $nbDisplayedComments);
                }
            }
        }

    }
}
