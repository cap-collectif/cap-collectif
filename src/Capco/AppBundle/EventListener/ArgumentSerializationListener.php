<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ArgumentSerializationListener implements EventSubscriberInterface
{
    private $router;
    private $tokenStorage;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage)
    {
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Argument',
                'method' => 'onPostArgument',
            ]
        ];
    }

    public function onPostArgument(ObjectEvent $event)
    {
        $argument = $event->getObject();
        $user = $this->tokenStorage->getToken()->getUser();

        $event->getVisitor()->addData(
            'has_user_voted', $user === "anon." ? false : $argument->userHasVote($user)
        );

        $event->getVisitor()->addData(
            'has_user_reported', $user === "anon." ? false : $argument->userHasReport($user)
        );

    }
}
