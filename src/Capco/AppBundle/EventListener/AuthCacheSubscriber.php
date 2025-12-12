<?php

namespace Capco\AppBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class AuthCacheSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly TokenStorageInterface $tokenStorage)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'kernel.response' => 'onKernelResponse',
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        $token = $this->tokenStorage->getToken();

        $isAuthenticated =
            $token
            && null !== $token->getUser()
            && 'anon.' !== $token->getUser();

        if ($isAuthenticated) {
            $event->getResponse()->headers->set('X-User-Logged-In', '1');
        } else {
            $event->getResponse()->headers->set('X-User-Logged-In', '0');
        }
    }
}
