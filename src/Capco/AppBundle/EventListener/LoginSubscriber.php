<?php

namespace Capco\AppBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class LoginSubscriber implements EventSubscriberInterface
{
    private readonly TokenStorageInterface $tokenStorage;

    public function __construct(TokenStorageInterface $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => 'removeAnonPhoneCookie',
        ];
    }

    public function removeAnonPhoneCookie(ResponseEvent $event): void
    {
        $currentUser = $this->tokenStorage->getToken() ? $this->tokenStorage->getToken()->getUser() : null;
        $isAuthenticated = $currentUser && 'anon.' !== $currentUser;

        if (!$isAuthenticated) {
            return;
        }

        $response = $event->getResponse();
        $response->headers->clearCookie('AnonymousAuthenticatedWithConfirmedPhone');
    }
}
