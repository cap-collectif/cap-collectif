<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class SourceSerializationListener extends AbstractSerializationListener
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
                'class' => 'Capco\AppBundle\Entity\Source',
                'method' => 'onPostSource',
            ],
        ];
    }

    public function onPostSource(ObjectEvent $event)
    {
        $source = $event->getObject();
        $opinion = $source->getLinkedOpinion();
        $opinionType = $opinion->getOpinionType();
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';

        $event->getVisitor()->addData(
            'has_user_voted', $user === 'anon.' ? false : $source->userHasVote($user)
        );

        $event->getVisitor()->addData(
            'has_user_reported', $user === 'anon.' ? false : $source->userHasReport($user)
        );
    }
}
