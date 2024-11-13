<?php

namespace Capco\AppBundle\EventListener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Twig\Environment;

class EmptyUsernameListener
{
    protected TokenStorageInterface $tokenStorage;
    protected Environment $templating;

    public function __construct(TokenStorageInterface $tokenStorage, Environment $templating)
    {
        $this->tokenStorage = $tokenStorage;
        $this->templating = $templating;
    }

    public function onKernelRequest(RequestEvent $event)
    {
        if (!$event->isMasterRequest()) {
            return;
        }
        $token = $this->tokenStorage->getToken();
        // Skip if anonymous
        if (!$token || 'anon.' === $token->getUser()) {
            return;
        }
        // Skip if user has a username
        if (!empty($token->getUser()->getUsername())) {
            return;
        }
        $request = $event->getRequest();
        $route = $request->get('_route');
        // Skip if route is allowed
        $routes = array_merge(ShieldListener::AVAILABLE_ROUTES, [
            'graphql_endpoint',
            'graphql_multiple_endpoint',
        ]);
        if (\in_array($route, $routes, true)) {
            return;
        }
        if (false !== strpos($route, '_imagine')) {
            return;
        }
        $response = new Response(
            $this->templating->render('@CapcoApp/Default/choose_a_username.html.twig')
        );
        $event->setResponse($response);
    }
}
