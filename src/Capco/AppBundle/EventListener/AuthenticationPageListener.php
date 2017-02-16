<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;

class AuthenticationPageListener
{
    protected $manager;
    protected $router;

    public function __construct(Manager $manager, $router)
    {
        $this->manager = $manager;
        $this->router = $router;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        if (!$this->manager->isActive('authentication_page')) {
            return;
        }

        // TODO: If Authenticated allow

        $request = $event->getRequest();
        $uri = $request->getRequestUri();

        // Requesting API or GraphQL is allowed
        if (strpos($uri, '/api/') || strpos($uri, '/graphql/')) {
            return;
        }

        $redirect = new RedirectResponse($this->router->generateUrl('authentication_page'));
        $event->setResponse($redirect);
    }
}
