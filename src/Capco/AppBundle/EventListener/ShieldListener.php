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
    protected $tokenStorage;
    protected $templating;

    public function __construct(Manager $manager, $tokenStorage, $templating)
    {
        $this->manager = $manager;
        $this->tokenStorage = $tokenStorage;
        $this->templating = $templating;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        if (!$this->manager->isActive('shield_mode')) {
            return;
        }

        // If already authenticated, we don't need to show the shield
        $token = $this->tokenStorage->getToken();
        if ($token && $token->getUser() instanceof UserInterface) {
            return;
        }

        $request = $event->getRequest();
        $availableRoutes = [
          'capco_api_login_check',
          'facebook_login',
          'google_login',
          'api_login_check',
          'capco_app_api_users_postuser',
          'hwi_oauth_service_redirect',
          'app_get_api_token',
        ];

        if (in_array($request->get('_route'), $availableRoutes)) {
            return;
        }

        $response = new Response(
          $this->templating->render('CapcoAppBundle:Default:shield.html.twig')
        );
        $event->setResponse($response);
    }
}
