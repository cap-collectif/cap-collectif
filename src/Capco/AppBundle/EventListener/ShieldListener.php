<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Twig\Environment;

class ShieldListener
{
    final public const AVAILABLE_ROUTES = [
        // Basics
        '_wdt',

        // Login
        'login_check',
        'facebook_login',
        'openid_login',
        'franceconnect_login',
        'hwi_oauth_service_redirect',
        'saml_login',
        'cas_login',
        'capco_magic_link',

        // Public API
        'graphql_endpoint',

        // API documentation
        'graphiql_endpoint',

        // Internal API and file upload
        // for custom fields at registration
        'graphql_multiple_endpoint',
        'capco_app_api_medias_postmedia',

        // Account confirmation
        'account_confirm_email',
        'account_confirm_new_email',

        // Registration
        'capco_app_api_users_postuser',

        // Invitation
        'capco_app_user_invitation',

        // Password reset
        'fos_user_resetting_request',
        'fos_user_resetting_reset',
        'fos_user_resetting_send_email',
        'fos_user_resetting_check_email',

        //vote by mail
        'capco_app_debate_vote_by_token',

        //unsubscribe
        'capco_app_action_token',

        //health check
        'health_check',
    ];

    public function __construct(
        protected Manager $manager,
        protected TokenStorageInterface $tokenStorage,
        protected Environment $templating
    ) {
    }

    public function onKernelRequest(RequestEvent $event)
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

        if (\in_array($route, self::AVAILABLE_ROUTES, true)) {
            return;
        }

        if (str_contains((string) $route, '_imagine')) {
            return;
        }

        $response = new Response(
            $this->templating->render('@CapcoApp/Default/shield.html.twig', [
                'locale' => $request->getLocale(),
            ])
        );
        $event->setResponse($response);
    }
}
