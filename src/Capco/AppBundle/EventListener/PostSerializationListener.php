<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;

class PostSerializationListener extends AbstractSerializationListener
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\AppBundle\Entity\Post', 'method' => 'onPostSerialize'],
        ];
    }

    public function onPostSerialize(ObjectEvent $event)
    {
        $post = $event->getObject();

        $event->getVisitor()->addData('_links', [
            'show' => $this->router->generate('app_blog_show', ['slug' => $post->getSlug()], true),
        ]);
    }
}
