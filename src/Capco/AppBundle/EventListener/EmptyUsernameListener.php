<?php

namespace Capco\AppBundle\EventListener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Templating\EngineInterface;

class EmptyUsernameListener
{
    protected $tokenStorage;
    protected $templating;

    public function __construct(TokenStorageInterface $tokenStorage, EngineInterface $templating)
    {
        $this->tokenStorage = $tokenStorage;
        $this->templating = $templating;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        if (!$event->isMasterRequest()) {
            return;
        }

        $token = $this->tokenStorage->getToken();

        // Skip if none is authenticated
        if (!$token || is_string($token->getUser())) {
            return;
        }

        // Skip if user has a username
        if ($token->getUser()->getUsername()) {
            return;
        }

        $request = $event->getRequest();
        $route = $request->get('_route');

        $routes = array_merge(ShieldListener::AVAILABLE_ROUTES, ['overblog_graphql_endpoint']);
        if (in_array($route, $routes, true)) {
            return;
        }

        if (false !== strpos($route, '_imagine')) {
            return;
        }

        $response = new Response(
          $this->templating->render('CapcoAppBundle:Default:choose_a_username.html.twig')
        );
        $event->setResponse($response);
    }
}
