<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\User\UserInterface;

class ShieldListener
{
    protected $manager;
    protected $router;
    protected $tokenStorage;

    public function __construct(Manager $manager, $router, $tokenStorage)
    {
        $this->manager = $manager;
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        if (!$this->manager->isActive('shield_mode')) {
            return;
        }

        // If already authenticated, we don't need to show the page
        $token = $this->tokenStorage->getToken();
        if ($token && $token->getUser() instanceof UserInterface) {
            return;
        }

        $request = $event->getRequest();
        $uri = $request->getRequestUri();

        // If already requesting authentication page
        if (strpos($uri, 'shield')) {
            return;
        }

        // Requesting API or GraphQL is allowed
        if (strpos($uri, '/api/') || strpos($uri, '/graphql/')) {
            return;
        }

        $redirect = new RedirectResponse($this->router->generate('authentication_page'));
        $event->setResponse($redirect);
    }
}
