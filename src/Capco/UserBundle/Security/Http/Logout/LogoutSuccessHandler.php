<?php

namespace Capco\UserBundle\Security\Http\Logout;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use SimpleSAML\Auth\Simple;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Routing\Router;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;
use Symfony\Component\Translation\TranslatorInterface;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    protected $samlAuth;
    protected $router;
    protected $toggleManager;
    protected $translator;
    protected $session;
    protected $client;

    public function __construct(Simple $samlAuth, Router $router, Manager $toggleManager, TranslatorInterface $translator, Session $session, OpenAmClient $client)
    {
        $this->samlAuth = $samlAuth;
        $this->router = $router;
        $this->toggleManager = $toggleManager;
        $this->client = $client;
        $this->translator = $translator;
        $this->session = $session;
    }

    public function onLogoutSuccess(Request $request)
    {
        $deleteType = $request->get('deleteType');
        $returnTo = $request->headers->get('referer', '/');
        $this->session->invalidate();

        if ($this->toggleManager->isActive('login_saml')) {
            $this->samlAuth->logout($returnTo);
        }

        if ($deleteType) {
            $flashBag = $this->session->getFlashBag();

            if ('SOFT' === $deleteType) {
                $flashBag->add('success', $this->translator->trans('account-and-contents-anonymized'));
            } elseif ('HARD' === $deleteType) {
                $flashBag->add('success', $this->translator->trans('account-and-contents-deleted'));
            }
        }

        $response = new RedirectResponse($returnTo);

        if ($this->toggleManager->isActive('login_paris')) {
            $this->client->setCookie($request->cookies->get(OpenAmClient::COOKIE_NAME));
            $this->client->logoutUser();
            $response->headers->clearCookie(OpenAmClient::COOKIE_NAME, '/', OpenAmClient::COOKIE_DOMAIN);
        }

        return $response;
    }
}
