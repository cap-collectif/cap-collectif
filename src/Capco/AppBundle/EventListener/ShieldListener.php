<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\Security\Core\User\UserInterface;

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
        if (!$event->isMasterRequest()) {
            return;
        }

        if (!$this->manager->isActive('shield_mode')) {
            return;
        }

        // If already authenticated, we don't need to show the shield
        $token = $this->tokenStorage->getToken();
        if ($token && $token->getUser() instanceof UserInterface) {
            return;
        }

        $request = $event->getRequest();
        $route = $request->get('_route');

        $availableRoutes = [
          'capco_api_login_check',
          'overblog_graphql_endpoint',
          'overblog_graphql_graphiql',
          'facebook_login',
          'google_login',
          'nelmio_api_doc_index',
          'api_login_check',
          'account_confirm_email',
          'account_confirm_new_email',
          'capco_app_api_users_postuser',
          'hwi_oauth_service_redirect',
          'app_get_api_token',
          'sonata_media_view',
          'fos_user_resetting_request',
          'fos_user_resetting_reset',
          'fos_user_resetting_send_email',
          'fos_user_resetting_check_email',
          'sonata_media_download',
          '_wdt',
        ];

        if (in_array($route, $availableRoutes, true)) {
            return;
        }

        if (false !== strpos($route, '_imagine')) {
            return;
        }

        $response = new Response(
          $this->templating->render('CapcoAppBundle:Default:shield.html.twig')
        );
        $event->setResponse($response);
    }
}
