<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;

class UserSerializationListener extends AbstractSerializationListener
{
    private $router;
    private $manager;

    public function __construct(RouterInterface $router, Manager $manager)
    {
        $this->router = $router;
        $this->manager = $manager;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\UserBundle\Entity\User', 'method' => 'onPostUserSerialize'],
        ];
    }

    public function onPostUserSerialize(ObjectEvent $event)
    {
        $user = $event->getObject();

        $links = [
            'settings' => $this->router->generate('capco_profile_edit', [], true),
        ];
        if ($this->manager->isActive('profiles')) {
            $links['profile'] = $this->router->generate('capco_user_profile_show_all', ['slug' => $user->getSlug()], true);
        }

        $event->getVisitor()->addData('_links', $links);
    }
}
