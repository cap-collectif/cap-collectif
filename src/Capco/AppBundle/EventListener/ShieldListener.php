<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\HttpFoundation\Response;

class ShieldListener
{
    protected $manager;
    protected $router;
    protected $tokenStorage;
    protected $templating;

    public function __construct(Manager $manager, $router, $tokenStorage, $templating)
    {
        $this->manager = $manager;
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
        $this->templating = $templating;
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

        // Requesting API or GraphQL is allowed
        if (strpos($uri, '/api/') || strpos($uri, '/graphql/')) {
            return;
        }

        $response = new Response(
          $this->templating->render('CapcoAppBundle:Default:shield.html.twig')
        );
        $event->setResponse($response);
    }
}
