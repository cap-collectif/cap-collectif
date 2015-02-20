<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class HomepageControllerTest extends BaseTestHelper
{
    public function testHomepage()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $crawler = $client->request('GET', '/');
        $this->assertEquals("200", $client->getResponse()->getStatusCode());

        $toggleManager->deactivate('themes');
        $crawler = $client->request('GET', '/');
        $nbDisplayedThemes = $crawler->filter('.theme')->count();
        $this->assertEquals("0", $nbDisplayedThemes);
        $toggleManager->activate('themes');
        $crawler = $client->request('GET', '/');
        $nbDisplayedThemes = $crawler->filter('.theme')->count();
        $this->assertEquals("2", $nbDisplayedThemes);

        $toggleManager->deactivate('ideas');
        $crawler = $client->request('GET', '/');
        $nbDisplayedIdeas = $crawler->filter('.media--macro')->count();
        $this->assertEquals("0", $nbDisplayedIdeas);
        $toggleManager->activate('ideas');
        $crawler = $client->request('GET', '/');
        $nbDisplayedIdeas = $crawler->filter('.media--macro')->count();
        $this->assertEquals("3", $nbDisplayedIdeas);

        $toggleManager->deactivate('blog');
        $crawler = $client->request('GET', '/');
        $nbDisplayedPosts = $crawler->filter('.media--news')->count();
        $this->assertEquals("0", $nbDisplayedPosts);
        $toggleManager->activate('blog');
        $crawler = $client->request('GET', '/');
        $nbDisplayedPosts = $crawler->filter('.media--news')->count();
        $this->assertEquals("2", $nbDisplayedPosts);

        $toggleManager->deactivate('calendar');
        $crawler = $client->request('GET', '/');
        $nbDisplayedEvents = $crawler->filter('.event')->count();
        $this->assertEquals("0", $nbDisplayedEvents);
        $toggleManager->activate('calendar');
        $crawler = $client->request('GET', '/');
        $nbDisplayedEvents = $crawler->filter('.event')->count();
        $this->assertEquals("1", $nbDisplayedEvents);

    }

}
