<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Event;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\Serializer;
use Symfony\Component\Routing\RouterInterface;

class EventSerializationListener extends AbstractSerializationListener
{
    private $router;
    private $serializer;

    public function __construct(
      RouterInterface $router,
      Serializer $serializer
    ) {
        $this->router = $router;
        $this->serializer = $serializer;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => Event::class,
                'method' => 'onPostEvent',
            ],
        ];
    }

    public function onPostEvent(ObjectEvent $event)
    {
        $e = $event->getObject();

        if ($e) {
            $showUrl = $this->router->generate(
                'app_event_show',
                [
                    'slug' => $e->getSlug(),
                ],
                true
            );

            $event->getVisitor()->addData(
                '_links',
                [
                    'show' => $showUrl,
                ]
            );
        }
    }
}
