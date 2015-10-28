<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Toggle\Manager;
use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ThemeSerializationListener implements EventSubscriberInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        if (getenv('SYMFONY_USE_SSL')) {
            $router->getContext()->setScheme('https');
        }

        $this->router = $router;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Theme',
                'method' => 'onPostTheme',
            ],
        ];
    }

    public function onPostTheme(ObjectEvent $event)
    {
        $theme = $event->getObject();

        $event->getVisitor()->addData(
            '_links', [
                'show' => $this->router->generate('app_theme_show', [
                    'slug' => $theme->getSlug(),
                ], true),
            ]
        );
    }
}
