<?php

namespace Capco\UserBundle\Security\Http\Logout;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\MonCompteParis\OpenAmCaller;
use SimpleSAML\Auth\Simple;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Router;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    protected $samlAuth;
    protected $router;
    protected $toggleManager;

    public function __construct(Simple $samlAuth, Router $router, Manager $toggleManager)
    {
        $this->samlAuth = $samlAuth;
        $this->router = $router;
        $this->toggleManager = $toggleManager;
    }

    public function onLogoutSuccess(Request $request)
    {
        $returnTo = $request->headers->get('referer', '/');
        $request->getSession()->invalidate();

        if ($this->toggleManager->isActive('login_saml')) {
            $this->samlAuth->logout($returnTo);
        }

        $response = new RedirectResponse($returnTo);

        if ($this->toggleManager->isActive('login_paris')) {
            $response->headers->clearCookie(OpenAmCaller::COOKIE_NAME, '/', OpenAmCaller::COOKIE_DOMAIN);
        }

        return $response;
    }
}
