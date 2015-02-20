<?php

namespace Capco\AppBundle\Tests\Controller;

use Capco\AppBundle\Tests\BaseTestHelper;

class BlogControllerTest extends BaseTestHelper
{

    public function testBlogIndex()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $toggleManager->deactivate('blog');
        $crawler = $client->request('GET', '/blog');
        $this->assertEquals("404", $client->getResponse()->getStatusCode());

        $toggleManager->activate('blog');
        $crawler = $client->request('GET', '/blog');
        $this->assertTrue($client->getResponse()->isSuccessful());

        $nbDisplayedPosts = $crawler->filter('.media--news')->count();
        $this->assertEquals("2", $nbDisplayedPosts);
    }

    public function testBlogPost()
    {
        $client = static::createClient();
        $toggleManager = $client->getContainer()->get('capco.toggle.manager');

        $em = $client->getContainer()->get('doctrine.orm.entity_manager');

        $posts = $em->getRepository('CapcoAppBundle:Post')->findAll();

        foreach ($posts as $post) {

            $toggleManager->deactivate('blog');
            $crawler = $client->request('GET', '/blog/'.$post->getSlug());
            $this->assertEquals("404", $client->getResponse()->getStatusCode());

            $toggleManager->activate('blog');
            $crawler = $client->request('GET', '/blog/'.$post->getSlug());

            if (!$post->getIsPublished()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else if ($post->getPublishedAt() > new \DateTime()) {
                $this->assertEquals("404", $client->getResponse()->getStatusCode());
            } else {
                $this->assertEquals("200", $client->getResponse()->getStatusCode());
            }
        }

    }
}
