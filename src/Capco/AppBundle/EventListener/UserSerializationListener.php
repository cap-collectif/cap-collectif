<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;

class UserSerializationListener extends AbstractSerializationListener
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public static function getSubscribedEvents()
    {
        return [
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\UserBundle\Entity\User', 'method' => 'onPostUserSerialize'],
        ];
    }

    public function onPostUserSerialize(ObjectEvent $event)
    {
        $user = $event->getObject();

        $event->getVisitor()->addData(
            '_links',
            [
                'profile' => $this->router->generate('capco_user_profile_show_all', ['slug' => $user->getSlug()], true),
                'settings' => $this->router->generate('capco_profile_edit', [], true),
            ]
        );
    }
}
