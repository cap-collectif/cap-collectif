<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class ThemeControllerTest extends BaseTestHelper
{
    public function testThemeIndex()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $toggleManager->deactivate('themes');
        $crawler = $client->request('GET', '/themes');
        $this->assertEquals("404", $client->getResponse()->getStatusCode());

        $toggleManager->activate('themes');
        $crawler = $client->request('GET', '/themes');
        $this->assertTrue($client->getResponse()->isSuccessful());

        $nbDisplayedThemes = $crawler->filter('.theme')->count();
        $this->assertEquals("2", $nbDisplayedThemes);
    }

    public function testThemeShow()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $themes = $em->getRepository('CapcoAppBundle:Theme')->findAll();

        foreach ($themes as $theme) {

            $toggleManager->deactivate('themes');
            $crawler = $client->request('GET', '/themes/'.$theme->getSlug());
            $this->assertEquals("404", $client->getResponse()->getStatusCode());

            $toggleManager->activate('themes');
            $crawler = $client->request('GET', '/themes/'.$theme->getSlug());

            if (!$theme->getIsEnabled()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }
}
