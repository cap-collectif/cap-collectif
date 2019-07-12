<?php

namespace Capco\UserBundle\Security\Http\Logout;

use Capco\AppBundle\Enum\DeleteAccountType;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use SimpleSAML\Auth\Simple;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    protected $samlAuth;
    protected $router;
    protected $toggleManager;
    protected $client;
    protected $resourceOwner;

    public function __construct(
        RouterInterface $router,
        Manager $toggleManager,
        OpenAmClient $client,
        ResourceOwnerInterface $resourceOwner,
        ?Simple $samlAuth = null
    ) {
        $this->samlAuth = $samlAuth;
        $this->router = $router;
        $this->toggleManager = $toggleManager;
        $this->client = $client;
        $this->resourceOwner = $resourceOwner;
    }

    public function onLogoutSuccess(Request $request)
    {
        $deleteType = $request->get('deleteType');
        $returnTo =
            DeleteAccountType::SOFT === $deleteType || DeleteAccountType::HARD === $deleteType
                ? $this->router->generate('app_homepage', ['deleteType' => $deleteType])
                : $request->headers->get('referer', '/');

        $request->getSession()->invalidate();

        if ($this->toggleManager->isActive('login_saml')) {
            $this->samlAuth->logout($returnTo);
        }

        $response = new RedirectResponse($returnTo);

        if (
            $this->toggleManager->isActive('login_paris') &&
            $request->cookies->has(OpenAmClient::COOKIE_NAME)
        ) {
            $this->client->setCookie($request->cookies->get(OpenAmClient::COOKIE_NAME));
            $this->client->logoutUser();
            $response->headers->clearCookie(
                OpenAmClient::COOKIE_NAME,
                '/',
                OpenAmClient::COOKIE_DOMAIN
            );
        }

        if (
            $this->toggleManager->isActive('login_openid') &&
            $this->toggleManager->isActive('disconnect_openid') &&
            $request->query->get('ssoSwitchUser')
        ) {
            $logoutURL = $this->resourceOwner->getOption('logout_url');

            $homepageUrl = $this->router->generate(
                'app_homepage',
                [],
                RouterInterface::ABSOLUTE_URL
            );
            $redirectUri = $homepageUrl . '/login/openid?_destination=' . $homepageUrl;

            $response = new RedirectResponse(
                $logoutURL . '?redirect_uri=' . utf8_encode($redirectUri) ?? '/'
            );
        }

        return $response;
    }
}
