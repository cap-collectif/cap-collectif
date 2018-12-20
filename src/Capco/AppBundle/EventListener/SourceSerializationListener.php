<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class SourceSerializationListener extends AbstractSerializationListener
{
    private $tokenStorage;

    public function __construct(TokenStorageInterface $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents(): array
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
        // We skip if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }
        $source = $event->getObject();
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';

        $event->getVisitor()->addData(
            'hasUserVoted', 'anon.' === $user ? false : $source->userHasVote($user)
        );

        $event->getVisitor()->addData(
            'hasUserReported', 'anon.' === $user ? false : $source->userHasReport($user)
        );
    }
}
