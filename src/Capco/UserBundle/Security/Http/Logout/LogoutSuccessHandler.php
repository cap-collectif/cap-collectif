<?php

namespace Capco\UserBundle\Security\Http\Logout;

use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Router;
use Capco\AppBundle\Toggle\Manager;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    protected $samlAuth;
    protected $router;
    protected $toggleManager;

    public function __construct(\SimpleSAML_Auth_Simple $samlAuth, Router $router, Manager $toggleManager)
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

        return new RedirectResponse($returnTo);
    }
}
