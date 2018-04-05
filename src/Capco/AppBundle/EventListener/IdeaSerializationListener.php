<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Helper\IdeaHelper;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class IdeaSerializationListener extends AbstractSerializationListener
{
    private $router;
    private $tokenStorage;
    private $mediaExtension;
    private $ideaHelper;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage, MediaExtension $mediaExtension, IdeaHelper $ideaHelper)
    {
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
        $this->mediaExtension = $mediaExtension;
        $this->ideaHelper = $ideaHelper;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Idea',
                'method' => 'onPostIdea',
            ],
        ];
    }

    public function onPostIdea(ObjectEvent $event)
    {
        // We skip if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }

        $idea = $event->getObject();
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';

        $event->getVisitor()->addData(
            '_links', [
                'show' => $this->router->generate('app_idea_show', ['slug' => $idea->getSlug()], true),
                'index' => $this->router->generate('app_idea', [], true),
            ]
        );

        if ($idea->getMedia()) {
            try {
                $event->getVisitor()->addData(
                    'media', [
                        'url' => $this->mediaExtension->path($idea->getMedia(), 'idea'),
                    ]
                );
            } catch (RouteNotFoundException $e) {
                // Avoid some SonataMedia problems
            }
        }

        $event->getVisitor()->addData(
            'userHasVote', 'anon.' === $user ? false : $this->ideaHelper->hasUserVoted($idea, $user)
        );

        $event->getVisitor()->addData(
            'userHasReport', 'anon.' === $user ? false : $this->ideaHelper->hasUserReported($idea, $user)
        );
    }
}
